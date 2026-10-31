# User Permissions

Authorization map for controllers in `backend/src/main/java/com/jabai/campustrack/Controllers`. This document reflects controller mappings, method-level `@PreAuthorize` annotations, and the request rules in `Securities/SecurityConfig.java`.

## How authorization works

- `@EnableMethodSecurity` activates `@PreAuthorize` checks.
- `hasRole('X')` requires role `X`; `hasAnyRole(...)` accepts any listed role.
- Every request requires authentication unless its path is in `PUBLIC_PATHS` or the `spring.application.security.dev-open` setting opens its path.
- Public paths: `POST /api/auth/register`, `POST /api/auth/login`, and `/error`.
- When `spring.application.security.dev-open=true`, `DEV_OPEN_PATHS` permits requests at the URL authorization layer. Method-level `@PreAuthorize` checks still apply.
- A route with no `@PreAuthorize` has no role-specific method check. Outside public/dev-open paths, it still requires an authenticated request.

## Controller permissions

### Buildings — `/api/buildings`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/buildings` | `ADMIN` |
| GET | `/api/buildings` | Any authenticated user; no method-level role check |
| GET | `/api/buildings/search` | Any authenticated user; no method-level role check |
| GET | `/api/buildings/{id}` | Any authenticated user; no method-level role check |
| PATCH | `/api/buildings/{id}` | `ADMIN` |
| DELETE | `/api/buildings/{id}` | `ADMIN` |

### Rooms — `/api/rooms`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/rooms` | `ADMIN` |
| GET | `/api/rooms` | Any authenticated user; no method-level role check |
| GET | `/api/rooms/search` | Any authenticated user; no method-level role check |
| GET | `/api/rooms/{id}` | Any authenticated user; no method-level role check |
| PATCH | `/api/rooms/{id}` | `ADMIN` |
| DELETE | `/api/rooms/{id}` | `ADMIN` |

### Assets — `/api/assets`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/assets` | `ADMIN` |
| GET | `/api/assets` | Any authenticated user; no method-level role check |
| GET | `/api/assets/search` | Any authenticated user; no method-level role check |
| GET | `/api/assets/{id}` | Any authenticated user; no method-level role check |
| PATCH | `/api/assets/{id}` | `ADMIN` |
| DELETE | `/api/assets/{id}` | `ADMIN` |

### NFC tags — `/api/nfc-tags`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/nfc-tags` | `ADMIN` |
| GET | `/api/nfc-tags` | Any authenticated user; no method-level role check |
| GET | `/api/nfc-tags/{id}` | Any authenticated user; no method-level role check |
| GET | `/api/nfc-tags/search` | Any authenticated user; no method-level role check |
| PATCH | `/api/nfc-tags/{id}` | `ADMIN` |
| DELETE | `/api/nfc-tags/{id}` | `ADMIN` |

### Maintenance records — `/api/maintenance-records`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/maintenance-records` | `ADMIN` or `WORKER` |
| GET | `/api/maintenance-records` | `ADMIN` or `WORKER` |
| GET | `/api/maintenance-records/search` | `ADMIN` or `WORKER` |
| GET | `/api/maintenance-records/{id}` | `ADMIN` or `WORKER` |
| PATCH | `/api/maintenance-records/{id}` | `ADMIN` or `WORKER` |
| DELETE | `/api/maintenance-records/{id}` | `ADMIN` |

### Incidents — `/api/incidents`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/incidents` | `ADMIN`; or `WORKER`/`STUDENT` when `request.reportedById` matches the authenticated user's name (user ID) |
| GET | `/api/incidents` | `ADMIN`, `WORKER`, or `STUDENT` |
| GET | `/api/incidents/search` | `ADMIN`, `WORKER`, or `STUDENT` |
| GET | `/api/incidents/{id}` | `ADMIN`, `WORKER`, or `STUDENT` |
| PATCH | `/api/incidents/{id}` | `ADMIN`; or `WORKER`/`STUDENT` when `incidentService.isOwner(id, authentication.name)` returns true |
| DELETE | `/api/incidents/{id}` | `ADMIN`; or `WORKER`/`STUDENT` when `incidentService.isOwner(id, authentication.name)` returns true |

### Authentication — `/api/auth`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/admin-only-test` | `ADMIN` |
| GET | `/api/auth/worker-only-test` | `WORKER` |
| GET | `/api/auth/user-only-test` | `STUDENT` |

The three `*-only-test` routes are role-check examples in the controller.

### Profile — `/api/profile`

| Method | Route | Permission |
|---|---|---|
| GET | `/api/profile/me` | Any authenticated user; operates on the authenticated user's profile |
| PATCH | `/api/profile/me` | Any authenticated user; operates on the authenticated user's profile |
| PATCH | `/api/profile/me/change-password` | Any authenticated user; operates on the authenticated user's password |
| DELETE | `/api/profile/me` | Any authenticated user; deletes the authenticated user's account |

These routes have no method-level `@PreAuthorize`; they use the authenticated principal's user ID in the controller.

### PDF parser — `/api/pdf-parser`

| Method | Route | Permission |
|---|---|---|
| POST | `/api/pdf-parser` | Any authenticated user; no method-level role check |

When `spring.application.security.dev-open=true`, this path is also in `DEV_OPEN_PATHS` and may pass URL-level authorization without authentication.

## Notes

- `GET` routes without a method-level role check do not have controller-level role restrictions. The global request rule still applies unless public/dev-open configuration changes it.
- `DEV_OPEN_PATHS` includes assets, buildings, incidents, maintenance records, NFC tags, rooms, and PDF parser routes. It does not include auth or profile routes.
- Role and ownership checks above describe the current annotations. They do not imply additional data filtering unless the annotation calls an ownership check.
