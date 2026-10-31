# Database Design

Source of truth for schema: Flyway migrations in `backend/src/main/resources/db/migration`. JPA entities in `com.jabai.campustrack.Models` must match those migrations. Enums are stored as `VARCHAR` and must match Java enum names exactly (`@Enumerated(EnumType.STRING)`).

Hibernate `ddl-auto` is validate/none. Schema changes go through new migrations only.

---

## 1. Overview

CampusTrack uses MySQL for campus users, locations, assets, NFC tags, incidents, and maintenance history.

Core shape:

```text
Building 1─* Room 1─* Asset 1─* NfcTag
Room 1─* Incident *─0..1 Asset
Incident *─1 User (reported_by)
Incident *─0..1 User (assigned_to)
Incident 1─* MaintenanceRecord *─1 User
User 1─1 UserProfile
```

Incidents may omit `asset_id` so facility issues (plumbing, electrical, etc.) can be room-only.

---

## 2. Migrations

| Version | File | What it does |
|---|---|---|
| V1 | `V1__Created_users_table_and_profiles.sql` | Creates `users` and `user_profiles`. |
| V2 | `V2__Created_buildings_and_rooms_table.sql` | Creates `buildings` and `rooms` (`room_number` as `INT`). |
| V3 | `V3__Created_assets_incidents_maintenance_records_and_nfc_tags_table.sql` | Creates `assets`, `nfc_tags`, `incidents`, `maintenance_records`; adds second unique constraint on rooms. |
| V4 | `V4__Modify_room_number_in_rooms_table.sql` | Changes `rooms.room_number` to `VARCHAR(50) NOT NULL`. |

Do not edit applied migrations. Add `V5__...` (and so on) for further changes.

---

## 3. Tables

| Table | JPA entity | Purpose |
|---|---|---|
| `users` | `User` | Auth account: email, password hash, role. |
| `user_profiles` | `UserProfile` | Display/profile data for a user (1:1). |
| `buildings` | `Building` | Campus buildings. |
| `rooms` | `Room` | Rooms inside buildings. |
| `assets` | `Asset` | Physical assets in a room. |
| `nfc_tags` | `NfcTag` | NFC tags bound to assets. |
| `incidents` | `Incident` | Reported incidents (asset-optional). |
| `maintenance_records` | `MaintenanceRecord` | Work log against an incident. |

---

## 4. Entity relationship diagram

```text
┌──────────────┐       ┌────────────────┐
│    users     │1────1│ user_profiles  │
└──────┬───────┘       └────────────────┘
       │
       │ reported_by (1:N), assigned_to (0..1:N)
       │ maintenance_records.user_id (1:N)
       │
┌──────┴───────┐
│  buildings   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│    rooms     │
└──────┬───────┘
       │
       ├──────── 1:N ────────┐
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│    assets    │      │  incidents   │
└──────┬───────┘      └──────┬───────┘
       │ 1:N                 │ 0..1 asset_id
       ▼                     │ 1:N
┌──────────────┐             ▼
│   nfc_tags   │      ┌──────────────────────┐
└──────────────┘      │ maintenance_records  │
                      └──────────────────────┘
```

---

## 5. `users`

Auth credentials and role. Profile fields live in `user_profiles`, not here.

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | User id. |
| `email` | `VARCHAR(100)` | No | UNIQUE | Login email. |
| `password_hash` | `VARCHAR(255)` | No | | BCrypt hash only. Never plaintext. |
| `user_role` | `VARCHAR(50)` | No | | See `UserRole`. |
| `created_at` | `TIMESTAMP` | Yes* | `CURRENT_TIMESTAMP` | DB-populated. Java: `insertable = false, updatable = false`. |

\*Migration omits `NOT NULL` on `created_at`; default still sets it on insert.

### Enum: `UserRole` → `user_role`

| Value | Meaning |
|---|---|
| `ADMIN` | Administrator. |
| `WORKER` | Maintenance / campus worker. |
| `STUDENT` | Student user. |

### Model notes

- Entity field maps `password_hash` → Java `password` via `@Column(name = "password_hash")`.
- Required 1:1 with `UserProfile` (`optional = false`, cascade ALL).

---

## 6. `user_profiles`

One profile row per user. PK is also FK to `users.id` (`@MapsId`).

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `user_id` | `BIGINT UNSIGNED` | No | PK, FK → `users.id` | Same as user id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `first_name` | `VARCHAR(100)` | No | | Given name. |
| `middle_name` | `VARCHAR(100)` | Yes | | Optional. |
| `last_name` | `VARCHAR(100)` | No | | Family name. |
| `suffix` | `VARCHAR(20)` | Yes | | e.g. Jr., III. |
| `phone` | `VARCHAR(20)` | Yes | | Contact phone. |
| `student_number` | `VARCHAR(50)` | Yes | UNIQUE (`uq_user_profiles_student_number`) | Optional student id. |
| `department` | `VARCHAR(100)` | Yes | | Department / org unit. |
| `avatar_path` | `VARCHAR(500)` | Yes | | Avatar storage path. |

### Indexes / FKs

| Name | Definition |
|---|---|
| `idx_user_profiles_last_first` | `(last_name, first_name)` |
| `fk_user_profiles_user` | `user_id` → `users.id` **ON DELETE CASCADE ON UPDATE CASCADE** |

Deleting a user deletes their profile.

---

## 7. `buildings`

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Building id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `name` | `VARCHAR(100)` | No | | Building name. |

### Relationships

- One building → many rooms.
- `rooms.building_id` → `buildings.id` **ON DELETE CASCADE** (V2; no `ON UPDATE` clause).

---

## 8. `rooms`

### Columns (after V4)

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Room id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `building_id` | `BIGINT UNSIGNED` | No | FK → `buildings.id` | Parent building. |
| `room_number` | `VARCHAR(50)` | No | Unique with `building_id` | Room label (string after V4). |
| `capacity` | `INT` | No | | Max capacity. |
| `room_type` | `VARCHAR(50)` | No | | See `RoomType`. |
| `criticality` | `VARCHAR(50)` | No | | See `RoomCriticality`. |

### Constraints

| Name | Definition | Added in |
|---|---|---|
| `fk_rooms_building` | FK `building_id` → `buildings.id` ON DELETE CASCADE | V2 |
| `uq_rooms_building_room_number` | UNIQUE `(building_id, room_number)` | V2 |
| `uq_rooms_building_room` | UNIQUE `(building_id, room_number)` | V3 (duplicate unique) |

Same room number allowed in different buildings; not within one building.

### Enum: `RoomType` → `room_type`

`CLASSROOM`, `LABORATORY`, `LECTURE_HALL`, `OFFICE`, `SERVER_ROOM`, `STORAGE`, `WORKSHOP`, `CONFERENCE_ROOM`, `RESTROOM`, `OTHER`

### Enum: `RoomCriticality` → `criticality`

`LOW`, `NORMAL`, `HIGH`, `CRITICAL`

---

## 9. `assets`

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Asset id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `room_id` | `BIGINT UNSIGNED` | No | FK → `rooms.id` | Location. |
| `name` | `VARCHAR(100)` | No | | Display name. |
| `category` | `VARCHAR(50)` | No | | See `AssetCategory`. |
| `brand` | `VARCHAR(100)` | Yes | | Optional. |
| `model` | `VARCHAR(100)` | Yes | | Optional. |
| `serial_number` | `VARCHAR(100)` | Yes | | Optional. |
| `status` | `VARCHAR(50)` | No | | See `AssetStatus`. |
| `asset_condition` | `VARCHAR(50)` | No | | See `AssetCondition`. |
| `criticality` | `VARCHAR(50)` | No | | See `AssetCriticality`. |

### FK

`fk_assets_room`: `room_id` → `rooms.id` **ON DELETE CASCADE ON UPDATE CASCADE**

### Enums

| Java enum | Column | Values |
|---|---|---|
| `AssetCategory` | `category` | `COMPUTER`, `PROJECTOR`, `AIRCONDITIONER`, `FURNITURE`, `NETWORK_EQUIPMENT`, `LAB_EQUIPMENT`, `ELECTRICAL_EQUIPMENT`, `OFFICE_EQUIPMENT`, `OTHER` |
| `AssetStatus` | `status` | `IN_USE`, `AVAILABLE`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE`, `RETIRED` |
| `AssetCondition` | `asset_condition` | `GOOD`, `FAIR`, `DAMAGED`, `POOR` |
| `AssetCriticality` | `criticality` | `LOW`, `NORMAL`, `HIGH`, `CRITICAL` |

---

## 10. `nfc_tags`

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Tag row id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `asset_id` | `BIGINT UNSIGNED` | No | FK → `assets.id` | Bound asset. |
| `uid` | `VARCHAR(100)` | No | UNIQUE (`uq_nfc_tags_uid`) | Physical tag UID. |
| `status` | `VARCHAR(100)` | No | | See `NfcTagStatus`. |

### FK

`fk_nfc_tags_asset`: `asset_id` → `assets.id` **ON DELETE CASCADE ON UPDATE CASCADE**

### Enum: `NfcTagStatus` → `status`

`ACTIVE`, `INACTIVE`, `LOST`, `DAMAGED`, `REPLACED`

---

## 11. `incidents`

Central lifecycle table. Asset optional; room and reporter required.

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Incident id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | Reported time (DB). |
| `incident_number` | `VARCHAR(50)` | No | UNIQUE (`uq_incidents_number`) | Human-readable number. |
| `asset_id` | `BIGINT UNSIGNED` | Yes | FK → `assets.id` | Optional linked asset. |
| `room_id` | `BIGINT UNSIGNED` | No | FK → `rooms.id` | Room of the incident. |
| `reported_by` | `BIGINT UNSIGNED` | No | FK → `users.id` | Reporter. |
| `assigned_to` | `BIGINT UNSIGNED` | Yes | FK → `users.id` | Assignee. |
| `category` | `VARCHAR(50)` | No | | See `IncidentCategory`. |
| `description` | `TEXT` | No | | Problem description. |
| `safety_hazard` | `BOOLEAN` | No | `FALSE` | Safety flag for scoring. |
| `operational_impact` | `BOOLEAN` | No | `FALSE` | Ops impact flag. |
| `affected_area` | `INT` | No | `1` | Scope input for scoring. |
| `priority` | `VARCHAR(50)` | No | | See `IncidentPriority`. |
| `priority_score` | `INT` | No | `0` | Computed score. |
| `status` | `VARCHAR(100)` | No | | See `IncidentStatus`. |
| `evaluated_at` | `TIMESTAMP` | Yes | `NULL` | When evaluated. |
| `resolved_at` | `TIMESTAMP` | Yes | `NULL` | When resolved. |
| `closed_at` | `TIMESTAMP` | Yes | `NULL` | When closed. |

### Foreign keys

| Constraint | Column | Parent | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `fk_incidents_asset` | `asset_id` | `assets.id` | `SET NULL` | `CASCADE` |
| `fk_incidents_room` | `room_id` | `rooms.id` | `CASCADE` | `CASCADE` |
| `fk_incidents_reported_by` | `reported_by` | `users.id` | `RESTRICT` | `CASCADE` |
| `fk_incidents_assigned_to` | `assigned_to` | `users.id` | `SET NULL` | `CASCADE` |

### Enum: `IncidentCategory` → `category`

`EQUIPMENT_FAILURE`, `ELECTRICAL`, `PLUMBING`, `STRUCTURAL`, `HVAC`, `NETWORK_IT`, `FURNITURE`, `SAFETY_HAZARD`, `OTHER`

### Enum: `IncidentPriority` → `priority`

`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### Enum: `IncidentStatus` → `status`

Lifecycle (application-enforced; DB only stores the string):

```text
REPORTED → EVALUATED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED
```

### Asset vs facility report

- Asset-related: `room_id` set, `asset_id` set.
- Facility-related: `room_id` set, `asset_id` NULL.

### Evaluation fields

`safety_hazard`, `operational_impact`, `affected_area`, plus asset/room criticality (read from related rows) feed `priority_score` and `priority`. Those scores live on the incident row; the reporter does not pick priority as free input in the schema design.

---

## 12. `maintenance_records`

### Columns

| Column | Type | Null | Key / default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | PK, AI | Record id. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | DB-populated. |
| `incident_id` | `BIGINT UNSIGNED` | No | FK → `incidents.id` | Parent incident. |
| `user_id` | `BIGINT UNSIGNED` | No | FK → `users.id` | Worker who logged the action. |
| `action` | `VARCHAR(100)` | No | | Action label. |
| `remarks` | `TEXT` | Yes | | Optional notes. |
| `status` | `VARCHAR(100)` | No | | See `MaintenanceRecordStatus`. |
| `completed_at` | `TIMESTAMP` | Yes | `NULL` | Completion time. |

### Foreign keys

| Constraint | Column | Parent | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `fk_maintenance_incident` | `incident_id` | `incidents.id` | `CASCADE` | `CASCADE` |
| `fk_maintenance_user` | `user_id` | `users.id` | `RESTRICT` | `CASCADE` |

### Enum: `MaintenanceRecordStatus` → `status`

`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

---

## 13. Enum catalog (Java ↔ column)

All stored as `VARCHAR`. Values must match enum constant names.

| Java enum | Package | Table.column |
|---|---|---|
| `UserRole` | `Models.Enums` | `users.user_role` |
| `RoomType` | `Models.Enums` | `rooms.room_type` |
| `RoomCriticality` | `Models.Enums` | `rooms.criticality` |
| `AssetCategory` | `Models.Enums` | `assets.category` |
| `AssetStatus` | `Models.Enums` | `assets.status` |
| `AssetCondition` | `Models.Enums` | `assets.asset_condition` |
| `AssetCriticality` | `Models.Enums` | `assets.criticality` |
| `NfcTagStatus` | `Models.Enums` | `nfc_tags.status` |
| `IncidentCategory` | `Models.Enums` | `incidents.category` |
| `IncidentPriority` | `Models.Enums` | `incidents.priority` |
| `IncidentStatus` | `Models.Enums` | `incidents.status` |
| `MaintenanceRecordStatus` | `Models.Enums` | `maintenance_records.status` |

Never use `@Enumerated(EnumType.ORDINAL)`.

---

## 14. Foreign key summary

| Child | Column | Parent | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `user_profiles` | `user_id` | `users.id` | CASCADE | CASCADE |
| `rooms` | `building_id` | `buildings.id` | CASCADE | *(none in V2)* |
| `assets` | `room_id` | `rooms.id` | CASCADE | CASCADE |
| `nfc_tags` | `asset_id` | `assets.id` | CASCADE | CASCADE |
| `incidents` | `asset_id` | `assets.id` | SET NULL | CASCADE |
| `incidents` | `room_id` | `rooms.id` | CASCADE | CASCADE |
| `incidents` | `reported_by` | `users.id` | RESTRICT | CASCADE |
| `incidents` | `assigned_to` | `users.id` | SET NULL | CASCADE |
| `maintenance_records` | `incident_id` | `incidents.id` | CASCADE | CASCADE |
| `maintenance_records` | `user_id` | `users.id` | RESTRICT | CASCADE |

---

## 15. Uniqueness and integrity rules

1. `users.email` unique.
2. `user_profiles.student_number` unique when not null.
3. `(building_id, room_number)` unique on `rooms`.
4. `nfc_tags.uid` unique.
5. `incidents.incident_number` unique.
6. Every room has a building; every asset has a room; every NFC tag has an asset.
7. Every incident has a room and a reporter; asset and assignee optional.
8. Every maintenance record has an incident and a user.
9. Reporter / maintenance user cannot be deleted while referenced (`RESTRICT`).
10. Primary keys: `BIGINT UNSIGNED` auto-increment (profile uses shared PK with user).
11. `created_at` owned by DB; do not set from Java.
12. Passwords only as hashes in `password_hash`.

---

## 16. JPA model map

| Table | Entity class | Notes |
|---|---|---|
| `users` | `User` | Lazy `UserProfile`; role enum. |
| `user_profiles` | `UserProfile` | `@MapsId` / shared PK. |
| `buildings` | `Building` | |
| `rooms` | `Room` | Unique `(building, roomNumber)`. |
| `assets` | `Asset` | Optional brand/model/serial. |
| `nfc_tags` | `NfcTag` | Unique `uid`. |
| `incidents` | `Incident` | Nullable asset/assignee; lifecycle timestamps. |
| `maintenance_records` | `MaintenanceRecord` | Nullable `completed_at`. |

Relations default to `FetchType.LAZY`. Prefer `@EntityGraph` or fetch joins on list endpoints to avoid N+1.

---

## 17. Design notes

- Schema lives in migrations; entities follow migrations, not the reverse.
- Enums as strings keep dumps readable and avoid ordinal corruption.
- Separating `users` and `user_profiles` keeps auth columns small and profile fields expandable.
- Nullable `incidents.asset_id` covers both equipment and facility tickets without a second incident table.
- `maintenance_records` keep action history beyond the incident’s final status.
