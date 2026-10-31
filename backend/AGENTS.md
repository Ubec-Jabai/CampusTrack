# AGENTS.md — CampusTrack Backend

Campus Asset & Incident Management System. This file covers backend only (Spring Boot).

## Stack

- Java 25, Maven
- Spring Boot 4.1.1
- Spring Data JPA / Hibernate
- MySQL
- JWT auth (custom filter)
- Base package: `com.jabai.campustrack`
- Dependencies: Spring Boot starters and Boot-managed deps only. No Lombok. No other third-party libs. Existing deps stay.

## Related services

- Frontend: Next.js (App Router, TypeScript only, Tailwind, shadcn/ui). Separate codebase.
- PDF microservice: Python 3.14 / Django 6.1.1. Implemented. Generates incident report PDFs, uploads to Supabase Storage. Accepts same JWT as this backend. Keep JWT format stable.

## References

- `HELP.md` (backend root): Spring Initializr generated. Links to official Spring Boot reference docs and guides for starters in use. Check it before asking user about framework docs or which starters project has.
- Do not edit `HELP.md`. Generated file.
- Version-sensitive API (Spring Boot 4.1.1, Spring Framework 7, Java 25)? Follow official docs linked there. Do not rely on older Boot 2/3 memory.

## Commands

```bash
./mvnw spring-boot:run     # run dev server
./mvnw test                # run tests
./mvnw clean package       # build jar
```

Use `mvn` if wrapper missing.

## Package layout

```
com.jabai.campustrack
├── Controllers            # REST endpoints, thin
├── DTOs
│   ├── Requests           # inbound payloads, validated
│   └── Responses          # outbound payloads
├── Exceptions             # GlobalExceptionHandler, ErrorResponse
│   └── CustomExceptions   # ResourceNotFoundException, etc.
├── Models                 # JPA entities
│   └── Enums              # enums, stored as STRING
├── Repositories           # Spring Data JPA
│   └── Specifications     # JPA Specification for search/filter
├── Securities             # JWT filter, JwtUtil, security config
├── Services               # business logic
└── Validations
    ├── Interfaces         # custom constraint annotations (@interface)
    └── Validators         # ConstraintValidator implementations
```

Folder names PascalCase and plural. Follow this exactly. No new top-level package without asking. Annotation goes in `Validations/Interfaces`, its `ConstraintValidator` goes in `Validations/Validators`. Custom exception goes in `Exceptions/CustomExceptions`.

## Layering rules

- Controller: parse request, call service, return response. No business logic. No repository calls.
- Service: business rules, transactions (`@Transactional`), entity-to-DTO mapping.
- Repository: data access only.
- Search/filter: build with `Specification`, do not hand-write query strings per filter combo.
- Never return JPA entities from controllers. Use DTOs. Avoids lazy-load errors, infinite recursion on bidirectional relations, password hash leak.
- Validate input with Bean Validation (`@Valid`, `@NotBlank`, etc.) on request DTOs.
- One global `@RestControllerAdvice` for errors. Consistent error body.

## Domain model

Tables: `buildings`, `rooms`, `assets`, `nfc_tags`, `incidents`, `maintenance_records`, `users`, `user_profiles`.

```
Building 1─* Room 1─* Asset 1─* NfcTag
Room 1─* Incident *─0..1 Asset
Incident *─1 User (reported_by)
Incident *─0..1 User (assigned_to)
Incident 1─* MaintenanceRecord *─1 User
User 1─1 UserProfile
```

Key constraints:

- Room: unique `(building_id, room_number)`. `room_number` String(50).
- NfcTag: unique `uid`.
- Incident: unique `incident_number`.
- User: unique `email`. Store `password_hash` only. Never plaintext.
- UserProfile: PK = FK to `users.id` (1-to-1, cascade delete). unique `student_number`. All fields optional except `first_name`, `last_name`. Index on `(last_name, first_name)`.
- Asset: `brand`, `model`, `serial_number` optional.
- Incident timestamps: `evaluated_at`, `resolved_at`, `closed_at`.
- MaintenanceRecord: `completed_at`.

## Entity conventions

- Id: `Long`, `GenerationType.IDENTITY`.
- Enums: `@Enumerated(EnumType.STRING)`. Never ORDINAL.
- `created_at`: populated by DB. Mark `insertable = false, updatable = false`. Do not set in Java.
- Relations: `FetchType.LAZY` by default. Watch N+1; use `@EntityGraph` or fetch join when listing.
- Enums in use: RoomType, RoomCriticality, AssetCategory, AssetStatus, AssetCondition, AssetCriticality, NfcTagStatus, IncidentCategory, IncidentPriority, IncidentStatus, MaintenanceRecordStatus, UserRole (`ADMIN`, `WORKER`, `STUDENT`).
- Schema owned by migrations, not entities. See "Database design" section.

## Controllers and HTTP methods

Every entity controller follows same shape. Consistent. No per-controller style.

Method map (example resource `incidents`):

```
Create    -> POST    /api/incidents
Read      -> GET     /api/incidents/{id}
Read all  -> GET     /api/incidents
Update    -> PATCH   /api/incidents/{id}
Delete    -> DELETE  /api/incidents/{id}
```

Rules:

- Class name `<Entity>Controller` in `Controllers`. Annotate `@RestController` + `@RequestMapping("/api/<resource>")`.
- Resource name: lowercase, plural noun, kebab-case if multi-word (`/api/maintenance-records`, `/api/nfc-tags`).
- No verbs in URL. Method says action.
- Update = `PATCH` only. **No `PUT`.** Partial update: request DTO fields optional, service applies only non-null fields.
- Read all = `GET` on base path with query params: `page` (1-based), `size`, filters. Filters feed `Specification`. No request body on `GET`.
- Status codes: `POST` 201, `GET` 200, `PATCH` 200 (return updated response DTO), `DELETE` 204 (no body). Missing id = 404 via `ResourceNotFoundException`.
- Path id type `Long`. Name path var `id`.
- Controller thin: `@Valid` request, call one service method, return DTO. No repository, no business logic, no entity.
- New entity controller = copy shape of existing one (e.g. Building). Do not invent new style.

Good:
```java
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody CreateIncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.create(request));
    }

    @GetMapping("/{id}")
    public IncidentResponse getById(@PathVariable Long id) {
        return incidentService.getById(id);
    }

    @GetMapping
    public PageResponse<IncidentResponse> search(IncidentFilter filter,
                                                 @RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        return incidentService.search(filter, page, size);
    }

    @PatchMapping("/{id}")
    public IncidentResponse update(@PathVariable Long id, @Valid @RequestBody UpdateIncidentRequest request) {
        return incidentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incidentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

Bad:
```java
@RestController
public class IncidentController {
    @PostMapping("/api/createIncident")            // verb in URL
    public Incident create(@RequestBody Incident i) { ... }  // entity exposed, no @Valid, returns 200

    @PutMapping("/api/incident/update/{id}")       // PUT, verb, singular
    public Incident update(...) { ... }

    @GetMapping("/api/incidents/all")              // not base path
    public List<Incident> all() { ... }            // no pagination

    @DeleteMapping("/api/incidents/{id}")
    public String delete(@PathVariable Long id) { return "deleted"; }  // body on delete
}
```

### Non-database controllers

Controller not backed by DB entity (e.g. `PdfParserController`, whose job is send requests to Django microservice) is exception. CRUD URL map does not apply. Name and routes follow its purpose.

Still required:

- Thin controller. Logic in a service (e.g. `PdfParserService`) that calls Django.
- Use Spring built-in HTTP client only (`RestClient`). No third-party HTTP lib.
- Django base URL and timeouts from config. Never hardcode.
- Request/response DTOs in `DTOs.Requests` / `DTOs.Responses`. Regular classes.
- Same auth (JWT) and same global error handling. Django failure mapped to proper error, not raw 500 with stack trace.
- No repository calls in these controllers.
- Do not copy CRUD shape onto them. Do not turn them into fake CRUD.

## DTO rules

- DTO = regular class with private fields, getters, setters. **No `record`.** Keep codebase consistent with entities (also regular classes).
- Request DTO in `DTOs.Requests`, response DTO in `DTOs.Responses`. Name: `CreateRoomRequest`, `UpdateRoomRequest`, `RoomResponse`.
- Provide no-arg constructor (Jackson needs it with setters). Add all-args constructor only if used.
- Bean Validation annotations on fields, not getters.
- Response DTO built via static `from(Entity)` factory. No entity reference stored in DTO.
- No logic in DTO beyond mapping and validation. No JPA annotations in DTO.
- Never reuse one DTO for both request and response. Never put `passwordHash` in any response DTO.
- Separate create vs update request when fields or required-ness differ.
- **No Lombok.** No `@Getter`, `@Setter`, `@Data`, `@Builder`, `@AllArgsConstructor`. No third-party mapping or DTO libs (MapStruct, ModelMapper). Write getters/setters by hand. Use only Spring Boot built-ins (Bean Validation, Jackson from starters).

Bad:
```java
public record RoomResponse(Long id, String roomNumber, int capacity) {}
```

Good:
```java
public class RoomResponse {
    private Long id;
    private String roomNumber;
    private int capacity;

    public RoomResponse() {}

    public static RoomResponse from(Room room) {
        RoomResponse dto = new RoomResponse();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setCapacity(room.getCapacity());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
}
```

## Pagination

- Page number is **1-based** in API. Spring `Pageable` is 0-based. Convert at controller/service boundary (`page - 1`). Never leak 0-based into API.
- Validate `page >= 1`, cap `size`.
- Return stable response shape: items, page, size, total elements, total pages.

## Auth

- JWT, lifetime 1 day.
- Token carries **only user ID as string** (see `Securities/JwtUtil`). Load user + role from DB per request. Do not add claims without telling Django service owner.
- Passwords: BCrypt (`PasswordEncoder`).
- JWT secret from env/config. Never hardcode. Never commit.
- Auth controller handles login/register. Everything else authenticated unless explicitly public.
- Role/permission model **undecided**. Roles exist (`ADMIN`, `WORKER`, `USER`) but per-endpoint rules not final. Do not invent permission matrix. Ask before adding `@PreAuthorize` rules.
- Frontend keeps refresh token in localStorage. Known XSS risk. If refresh endpoint added, flag this.

## Config and secrets

- Config in `application.properties`/`application.yml`. Profiles: `dev`, `prod` if present.
- DB creds, JWT secret, Supabase keys from env vars. Never commit.
- CORS: allow only frontend origin. No `*` with credentials.

## Dependencies

Default: add nothing. Third-party dep = more attack surface, more upgrade pain, more build weight.

Order of preference:

1. JDK standard library.
2. Spring Boot / Spring Framework built-in (`RestClient`, Bean Validation, Jackson from starters, `PasswordEncoder`, etc.).
3. Spring Boot starter or Boot-managed dependency.
4. Third-party library. Last resort. Needs user approval.

Third-party dep allowed only when **necessary**:

- No JDK or Spring Boot way to do it, **or**
- Hand-rolling it is risky or complex (crypto, token signing/parsing, protocol handling).

Not necessary (do not add):

- Less boilerplate (Lombok, MapStruct, ModelMapper).
- Utility convenience (Apache Commons, Guava).
- Style preference or "nicer API".
- One-off helper that ~10 lines of Java solves.

Before adding any dependency:

1. Check JDK and Spring Boot cover it. Check `HELP.md` and official docs.
2. Check `pom.xml`. Maybe already there. No duplicates.
3. Tell user: what lib, why necessary, what built-in was rejected and why. Wait for approval.
4. Add to `pom.xml` only. Boot-managed dep: no explicit `<version>`. Correct `<scope>` (`test`, `runtime`, etc.).
5. Smallest artifact. One starter, not umbrella bundle.

Never add: Lombok. Never upgrade or remove existing deps unless asked.

## Code style

- Simple first. No abstraction until needed twice.
- Small methods, clear names. Constructor injection only. No field `@Autowired`.
- No Lombok. No third-party libs beyond Spring Boot built-ins.
- No `System.out.println`. Use SLF4J. Never log passwords, tokens, hashes.
- Targeted edits. Do not reformat or rename unrelated code.
- Keep new code consistent with existing controllers/services/specifications pattern. Copy pattern from an existing entity (e.g. Building) when adding new CRUD + search.

## Database design

Migrations in `src/main/resources/db/migration` = **source of truth** for schema. Read them before any DB or entity work.

Rules:

- Need table, column, index, constraint, FK info? Read migration files. Do not guess from entities.
- Entities must match migration: table name, column name, type, nullability, length, unique, FK.
- **Do not modify anything in `Models`** unless needed to match migration. No cosmetic edits, no field reorder, no rename, no added helper methods "while here".
- Migration and entity disagree? Migration wins. Fix entity minimally. Flag mismatch to user.
- Never edit an applied migration. Add new versioned file.
- New migration filename follows existing pattern in folder (e.g. `V<next>__<short_description>.sql`). Check latest version number first. Never reuse or skip numbers.
- One logical change per migration. Small.
- Every migration: explicit constraints (`NOT NULL`, `UNIQUE`, `FOREIGN KEY`), index on FK and on columns used for search/filter.
- `created_at` default set in migration (DB-populated). Enums stored as `VARCHAR`, values match Java enum names exactly.
- Destructive change (drop column/table, type narrowing, data rewrite): stop and ask user first. Warn about data loss and rollback.
- Hibernate `ddl-auto` = `none` or `validate`. Never `update`, `create`, `create-drop`.
- Schema change flow: write migration -> adjust entity only if needed -> adjust DTO/service/spec -> run app, confirm Hibernate validate passes.

## STRICT rules: no over-engineering

Solve the asked problem only. Smallest change that works. Follow existing patterns.

Forbidden unless user asks or real need shown:

- Interface with one implementation (`FooService` + `FooServiceImpl`). Use plain class.
- Generic base classes, abstract hierarchies, utility "frameworks".
- Design patterns (factory, builder, strategy, visitor) without 2+ concrete use cases.
- Extra layers (manager, helper, facade, mapper framework). Stick to Controllers -> Services -> Repositories.
- Any new dependency outside Spring Boot starters and Boot-managed deps (Lombok, MapStruct, ModelMapper, Apache Commons, Guava, etc.). Not allowed unless necessary and user approves. See "Dependencies" section.
- Caching, async, events, queues, feature flags, retry logic "for future".
- Config properties, flags, or parameters nobody uses.
- Features, endpoints, or fields not requested.
- Refactor, rename, reformat, or move unrelated code.
- Catch-all exception wrapping, defensive null checks on values that cannot be null.

Bad:
```java
public interface RoomMapper { RoomResponse toResponse(Room room); }

@Component
public class RoomMapperImpl implements RoomMapper {
    @Override
    public RoomResponse toResponse(Room room) { return RoomResponse.from(room); }
}
```

Good:
```java
RoomResponse.from(room)
```

Rule of thumb: duplicate twice is fine. Abstract on third.

## STRICT rules: comments

Code explains what. Comment explains only **why**, and only when not obvious.

Forbidden:

- Comment restating code.
- Javadoc on obvious methods, getters, setters, constructors, DTOs, entities.
- Commented-out code. Delete it. Git has history.
- Section banners (`// ===== helpers =====`).
- Change logs, author tags, dates, `// added by AI`, `// fixed bug`.
- `TODO`/`FIXME` without concrete reason. Prefer tell user in reply.

Allowed:

- Why a workaround exists.
- Non-obvious business rule (e.g. why priority score formula is shaped so).
- Constraint from other system (e.g. JWT shape must match Django service).

Bad:
```java
// Get room by id
public RoomResponse getById(Long id) {
    // Find room in database
    Room room = roomRepository.findById(id)
            // If not found throw exception
            .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    // Return response
    return RoomResponse.from(room);
}
```

Good:
```java
public RoomResponse getById(Long id) {
    Room room = roomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    return RoomResponse.from(room);
}
```

Good (why comment):
```java
// Django PDF service verifies this token. Subject must stay user id only.
String token = jwtUtil.generateToken(user.getId());
```

## Adding new entity checklist

1. Migration SQL in `resources/db/migration` first. Then entity in `Models` (+ enum in `Models.Enums`) matching it.
2. Repository in `Repositories` (extend `JpaRepository` + `JpaSpecificationExecutor`).
3. Specification in `Repositories.Specifications` for search fields.
4. Request DTO in `DTOs.Requests`, response DTO in `DTOs.Responses`.
5. Custom validation (if needed): annotation in `Validations.Interfaces`, validator in `Validations.Validators`.
6. New exception (if needed) in `Exceptions.CustomExceptions`; map it in global handler.
7. Service in `Services` with CRUD + search + pagination (1-based).
8. Controller in `Controllers`.
9. Tests.

## Testing

- Unit test services (mock repositories).
- Slice/integration tests for repositories and specifications via Spring Boot test starters. No Testcontainers or other third-party test libs without user approval. Watch H2 vs MySQL dialect differences.
- Test auth: unauthenticated = 401, wrong role = 403 once role model decided.
- Run `./mvnw test` before declaring done.

## Examples: bad vs good

### Dependency injection

Bad:
```java
@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;
}
```

Good:
```java
@Service
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
}
```

Why: final field, testable without Spring, no hidden null.

### Controller returns entity

Bad:
```java
@GetMapping("/users/{id}")
public User get(@PathVariable Long id) {
    return userRepository.findById(id).get();
}
```
Leaks `password_hash`. `.get()` throws `NoSuchElementException` -> 500. Controller hits repo.

Good:
```java
@GetMapping("/users/{id}")
public UserResponse get(@PathVariable Long id) {
    return userService.getById(id);
}
```
```java
// service
public UserResponse getById(Long id) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    return UserResponse.from(user);
}
```

### Control flow: guard clauses, no deep nesting

Bad:
```java
public void closeIncident(Long id) {
    Incident incident = incidentRepository.findById(id).orElse(null);
    if (incident != null) {
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            incident.setStatus(IncidentStatus.CLOSED);
            incident.setClosedAt(LocalDateTime.now());
            incidentRepository.save(incident);
        } else {
            throw new RuntimeException("bad status");
        }
    }
}
```
Silent no-op when missing. Generic exception. Arrow-shaped code.

Good:
```java
@Transactional
public void closeIncident(Long id) {
    Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));

    if (incident.getStatus() != IncidentStatus.RESOLVED) {
        throw new InvalidStateException("Only RESOLVED incident can be closed");
    }

    incident.setStatus(IncidentStatus.CLOSED);
    incident.setClosedAt(LocalDateTime.now());
}
```
Fail fast. Happy path flat. Dirty checking saves inside `@Transactional`, no explicit `save`.

### Switch on enum, no string compare

Bad:
```java
if (incident.getStatus().toString().equals("OPEN")) { ... }
```

Good:
```java
return switch (incident.getStatus()) {
    case OPEN -> handleOpen(incident);
    case RESOLVED -> handleResolved(incident);
    default -> throw new InvalidStateException("Unsupported status: " + incident.getStatus());
};
```

### Pagination 1-based

Bad:
```java
Pageable pageable = PageRequest.of(page, size); // client page=1 skips first page
```

Good:
```java
public PageResponse<RoomResponse> search(RoomFilter filter, int page, int size) {
    if (page < 1) throw new BadRequestException("page must be >= 1");
    int safeSize = Math.min(size, MAX_PAGE_SIZE);

    Pageable pageable = PageRequest.of(page - 1, safeSize, Sort.by("id"));
    Page<Room> result = roomRepository.findAll(RoomSpecifications.from(filter), pageable);
    return PageResponse.from(result, RoomResponse::from, page);
}
```
Response `page` echoes 1-based value.

### Specification for search

Bad:
```java
@Query("SELECT r FROM Room r WHERE (:name IS NULL OR r.name = :name) AND (:type IS NULL OR r.type = :type) ...")
Page<Room> search(String name, RoomType type, Pageable p);
```
Query grows with every filter.

Good:
```java
public final class RoomSpecifications {
    private RoomSpecifications() {}

    public static Specification<Room> from(RoomFilter f) {
        return Specification.where(hasType(f.getType()))
                .and(inBuilding(f.getBuildingId()));
    }

    private static Specification<Room> hasType(RoomType type) {
        return (root, q, cb) -> type == null ? null : cb.equal(root.get("roomType"), type);
    }

    private static Specification<Room> inBuilding(Long buildingId) {
        return (root, q, cb) -> buildingId == null ? null : cb.equal(root.get("building").get("id"), buildingId);
    }
}
```
`null` predicate = skipped. Each filter composable.

### N+1 on list

Bad:
```java
List<Incident> incidents = incidentRepository.findAll();
incidents.forEach(i -> i.getRoom().getRoomNumber()); // 1 query per incident
```

Good:
```java
@EntityGraph(attributePaths = {"room", "asset", "reportedBy"})
Page<Incident> findAll(Specification<Incident> spec, Pageable pageable);
```

### Entity mapping

Bad:
```java
@Enumerated(EnumType.ORDINAL)
private IncidentStatus status;

private LocalDateTime createdAt = LocalDateTime.now();

@ManyToOne(fetch = FetchType.EAGER)
private Room room;
```
Reorder enum = corrupt data. Java sets `created_at` (DB owns it). EAGER = hidden joins.

Good:
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private IncidentStatus status;

@Column(name = "created_at", insertable = false, updatable = false)
private LocalDateTime createdAt;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "room_id")
private Room room;
```

### Auth and passwords

Bad:
```java
user.setPasswordHash(request.password());
log.info("Login attempt {} / {}", email, request.password());
String token = Jwts.builder().subject(email).claim("role", "ADMIN").compact();
```
Plaintext password. Password in log. Wrong claims, breaks Django contract.

Good:
```java
user.setPasswordHash(passwordEncoder.encode(request.password()));
log.info("Login attempt for userId={}", user.getId());
String token = jwtUtil.generateToken(user.getId()); // subject = user id string only
```

### Exceptions and error body

Bad:
```java
try {
    return service.create(req);
} catch (Exception e) {
    e.printStackTrace();
    return null;
}
```

Good:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_ERROR", ex.getBindingResult().getFieldError().getDefaultMessage()));
    }
}
```
Service throws specific exception. One place maps to HTTP.

### Validation on DTO

Bad:
```java
public Room create(Room room) { return roomRepository.save(room); } // trust client
```

Good:
```java
public class CreateRoomRequest {
  @NotNull
  private Long buildingId;

  @NotBlank
  @Size(max = 50)
  private String roomNumber;

  @Min(0)
  private int capacity;

  @NotNull
  private RoomType roomType;

  public CreateRoomRequest() {}

  public Long getBuildingId() { return buildingId; }
  public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }

  public String getRoomNumber() { return roomNumber; }
  public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

  public int getCapacity() { return capacity; }
  public void setCapacity(int capacity) { this.capacity = capacity; }

  public RoomType getRoomType() { return roomType; }
  public void setRoomType(RoomType roomType) { this.roomType = roomType; }
}

@PostMapping
public ResponseEntity<RoomResponse> create(@Valid @RequestBody CreateRoomRequest req) {
  return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(req));
}
```

### Transactions

Bad:
```java
@Transactional
public List<RoomResponse> list() { ... } // write tx on pure read
```
Controller-level `@Transactional` also bad.

Good:
```java
@Transactional(readOnly = true)
public PageResponse<RoomResponse> search(...) { ... }

@Transactional
public RoomResponse create(CreateRoomRequest req) { ... }
```
`@Transactional` on service only.

### Logging

Bad:
```java
System.out.println("created " + incident);
```
`toString` on entity may trigger lazy load, dump sensitive data.

Good:
```java
log.info("Incident created id={} number={}", incident.getId(), incident.getIncidentNumber());
```

### Magic values and naming

Bad:
```java
if (size > 100) size = 100;
int p = calc(i);
```

Good:
```java
private static final int MAX_PAGE_SIZE = 100;
int priorityScore = calculatePriorityScore(incident);
```

## Do not

- Do not expose entities directly.
- Do not use `record` for DTOs. Regular class, getters, setters.
- Do not use `PUT` for update. Use `PATCH`.
- Do not put verbs in URLs. Do not put business logic in controllers.
- Do not break CRUD URL/method map on entity controllers. Only non-DB controllers (e.g. `PdfParserController`) may differ.
- Do not use ORDINAL enums.
- Do not set `created_at` from Java.
- Do not change JWT payload shape without checking Django service.
- Do not invent role permissions.
- Do not commit secrets, `.env`, or prod DB dumps.
- Do not use `ddl-auto=update`/`create`/`create-drop`. Schema = migrations only.
- Do not edit applied migration files. Add new one.
- Do not touch `Models` unless needed to match migration.
- Do not over-engineer. No single-impl interfaces, no speculative abstractions.
- Do not add Lombok or any third-party dependency outside Spring Boot built-ins. Existing deps stay.
- Do not write comments that restate code. No commented-out code.
- Do not do broad refactors unless asked.

## Known gaps

- Role/permission rules not defined.
- Frontend mostly unbuilt. Only sample CRUD + search wired.