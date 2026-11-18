# AGENTS.md — CampusTrack Frontend

Campus Asset & Incident Management System. This file covers frontend only. Backend: Spring Boot. PDF service: Django.

## Stack

- Next.js (latest), App Router, TypeScript only. No `.js`/`.jsx`.
- Tailwind CSS + shadcn/ui built on React Aria (`react-aria-components`).
- Icons: `lucide-react`.
- State: client and server side both used.
- Backend REST API (Spring Boot 4.1.1, JWT auth). Frontend never talks to MySQL or Django directly.

## Core Rules

- No over-engineering. Simplest thing that works.
- No unnecessary comments. Code must read clear. Comment only for non-obvious why.
- No new dependency unless existing stack cannot do it. Ask first.
- Do not modify code outside task scope.
- Follow existing patterns in the repo before inventing new ones. Check the sample CRUD/search first.
- No `any`. Use real types. Use `unknown` + narrowing if type truly unknown.
- No dead code, no unused imports, no console.log left behind.

## STRICT: Modifying Existing Human Code

Human-written code = working, reviewed, intentional until proven otherwise. Treat as owned by someone else. Minimal footprint.

- Touch only lines needed for the task. Smallest diff possible.
- No refactor, rename, reformat, reorder, or "cleanup" of code outside task scope. Even if ugly.
- No reformat of whole file. Match existing style, indentation, quotes, semicolons, import order. Do not run formatter on untouched code.
- Do not delete or rewrite working code unless task requires it. Do not delete comments written by human.
- Do not change function signature, prop names, exported name, route path, type shape, or file location unless task requires it. If change breaks callers, update all callers in same change and list them.
- Read file fully and check callers (grep usages) before editing. Do not edit from assumption.
- Keep existing pattern even if you prefer another. No swapping library, state approach, or data-fetching style mid-file.
- No new abstraction, helper, or wrapper to "improve" existing code.
- No silent behavior change. If fix changes behavior, say so.
- Found bug or smell outside scope: do not fix. Report it in summary. Let human decide.
- Do not touch generated files, lockfiles, `components/ui/` shadcn primitives, or config files unless task requires it.
- Unsure why code is written that way: assume reason exists. Ask before changing.
- Do not overwrite whole file when `Edit` on specific lines works.
- After edit: show diff summary — files touched, what changed, why. Nothing unrelated in diff.

## STRICT: No `any`

`any` banned. Zero exceptions without human approval.

- No explicit `any`. No `as any`. No `Array<any>`, `any[]`, `Record<string, any>`, `Promise<any>`.
- No `// @ts-ignore`, `// @ts-nocheck`, `// @ts-expect-error` to dodge type error. Fix the type.
- No `eslint-disable` for `@typescript-eslint/no-explicit-any`.
- API data: type with interface in `types/` mirroring backend DTO. Never `res.json()` into untyped value. Use generic: `apiFetch<Incident>()`.
- Truly unknown shape (parsed JSON, caught error, external input): use `unknown`, then narrow with `typeof`, `in`, `instanceof`, or type guard before use.
- Caught error: `catch (e: unknown)`. Narrow with `e instanceof Error`.
- Generic helper: use generics (`<T>`), not `any`.
- Event handlers: use React types (`React.ChangeEvent<HTMLInputElement>`), not `any`.
- No type assertion (`as X`) to silence compiler. Allowed only when narrowing is impossible and value proven by validation. Prefer type guard.
- Third-party lib lacks types: install `@types/*` or write minimal local `.d.ts`. Do not cast to `any`.
- `tsconfig`: keep `"strict": true`. Do not loosen.
- Existing `any` in human code: do not touch unless task requires it. Report it in summary.

Bad:

```ts
async function load(id: any): Promise<any> {
  const res = await fetch(`/api/incidents/${id}`);
  const data: any = await res.json();
  return data.incident;
}

try {
  await save(form as any);
} catch (e: any) {
  toast(e.message);
}
```

Good:

```ts
async function load(id: number): Promise<Incident> {
  return apiFetch<Incident>(`/api/incidents/${id}`);
}

try {
  await save(form);
} catch (e: unknown) {
  toast(e instanceof Error ? e.message : "Unexpected error");
}
```

Narrowing unknown:

```ts
function isApiError(v: unknown): v is ApiError {
  return typeof v === "object" && v !== null && "message" in v;
}
```

## Structure

Next.js App Router with `src` dir (`create-next-app --src-dir`). All app code lives under `src/`.

```
frontend/
├── src/
│   ├── app/            routes, layouts, loading/error files
│   ├── components/
│   │   └── ui/         shadcn (React Aria) wrappers
│   ├── lib/
│   │   └── api/        API layer
│   └── types/          backend DTO types, enums
├── public/             static assets
├── components.json     shadcn config
├── next.config.ts
└── tsconfig.json
```

Folder names under `src/` beyond `app/` are the convention. If repo differs, follow repo.

- Short names elsewhere in this file (`components/`, `lib/`, `types/`, `components/ui/`) mean `src/components/`, `src/lib/`, `src/types/`, `src/components/ui/`.
- Import alias: `@/*` maps to `./src/*`. Use `@/lib/...`, `@/components/...`. No deep relative imports (`../../../`).
- **Never create `app/` or `pages/` at project root.** Next.js then ignores `src/app/`. Routes go in `src/app/` only.
- Middleware/proxy file goes in `src/` (beside `app/`), not project root. Name: `src/proxy.ts` on current Next, `src/middleware.ts` on older.
- Config files stay at project root: `next.config.ts`, `tsconfig.json`, `components.json`, `postcss.config.*`, `.env*`.
- Global CSS: `src/app/globals.css`. Do not add a second global stylesheet.
- Keep `page.tsx` thin; compose from components.
- Server Components by default. Add `"use client"` only for hooks, event handlers, browser APIs.
- Reusable UI in `src/components/`. Group by feature: `src/components/incidents/`, `src/components/assets/`. shadcn primitives in `src/components/ui/` — do not hand-edit unless needed; extend by wrapping.
- API calls in one place (`src/lib/api`). No raw `fetch` scattered in components.
- Types mirroring backend DTOs in `src/types/`. Keep names matching backend.
- Route-only helpers (private components used by one route) may sit beside `page.tsx` in `_components/` (underscore folder = not routable). Shared components go in `src/components/`.

## API Contract

Entity endpoints follow fixed map (example: incidents):

| Action | Request |
|---|---|
| Create | `POST /api/incidents` |
| Read one | `GET /api/incidents/{id}` |
| Read all | `GET /api/incidents` |
| Update | `PATCH /api/incidents/{id}` |
| Delete | `DELETE /api/incidents/{id}` |

- Same pattern for buildings, rooms, assets, nfc-tags, maintenance-records, users.
- Update uses `PATCH`, never `PUT`.
- **Pagination is 1-based.** Page 1 is first page. Never send `page=0`.
- Non-entity endpoints (auth, PDF report forwarding) are exceptions. Check backend controller before assuming shape.
- Do not guess endpoint, field name, or enum value. Read backend DTO/controller/migration. Schema source of truth: `resources/db/migration`.

## Domain Enums

Backend stores enums as STRING. Match exactly, case-sensitive.

- `UserRole`: `ADMIN`, `WORKER`, `STUDENT`.
- Other enums (`AssetStatus`, `AssetCondition`, `AssetCriticality`, `AssetCategory`, `RoomType`, `RoomCriticality`, `NfcTagStatus`, `IncidentCategory`, `IncidentPriority`, `IncidentStatus`, `MaintenanceRecordStatus`): copy values from backend `Models.Enums`. Define once in `types/`, reuse everywhere.

## Auth

- JWT from backend. Lifetime one day. Token carries user ID only — role not in token; get role from user/me endpoint.
- Send `Authorization: Bearer <token>` on protected requests.
- Handle `401`: clear session, redirect to login.
- Handle `403`: show forbidden state, do not retry.
- Role/permission model not finalized. Do not hardcode role-based UI rules beyond what is already in repo. Ask before adding.
- Never trust client-side role check for security. Backend enforces. Frontend checks are UX only.

## Data Fetching and State

- Server data: fetch in Server Components where possible.
- Client mutations: call API layer, then refresh/revalidate affected data.
- Do not duplicate server state into client state without reason.
- Always handle three states: loading, error, empty.
- Form validation: client-side for UX, but backend errors must be surfaced to user.

## UI Rules

- Use shadcn/ui (React Aria) components first. Never raw `<button>`, `<input>`, `<select>`, `<a>` when a component exists. Tailwind utility classes only; no custom CSS files unless unavoidable.
- No inline `style` unless value is dynamic.
- Responsive: mobile layout must work. NFC scanning and incident reporting are likely used on phones.
- Accessible: label inputs, keyboard reachable, visible focus, alt text. React Aria handles most a11y — do not break it.
- Reuse existing components before making new.

## STRICT: React Aria

shadcn components here wrap `react-aria-components`. Follow React Aria API, not plain DOM/React API.

- Import primitives from the project's `components/ui/*` wrappers first. Import `react-aria-components` directly only when no wrapper exists.
- Press events: `onPress`, not `onClick`. Disabled: `isDisabled`, not `disabled`. Read-only: `isReadOnly`. Required: `isRequired`. Invalid: `isInvalid`.
- Forms: use `TextField` + `Label` + `Input` + `FieldError` composition. Do not use bare `<input>` with manual `<label>`.
- Selection (`Select`, `ComboBox`, `ListBox`, `Tabs`, `Table`): use `selectedKey` / `onSelectionChange` with `Key` type. Each item needs stable `id` (use entity `id`, not array index).
- Collections: pass `items` and render function, or give each item `id`. No index keys.
- Styling state: use data attributes in Tailwind (`data-[pressed]`, `data-[hovered]`, `data-[focused]`, `data-[focus-visible]`, `data-[disabled]`, `data-[selected]`, `data-[invalid]`). No manual hover/focus state in JS.
- `className` may be a function of render props. Keep that pattern in existing wrappers.
- Links and navigation: wire `RouterProvider` to Next.js router so `Link` does client-side nav. Do not wrap `next/link` around React Aria `Button`.
- Overlays (`Dialog`, `Modal`, `Popover`, `Tooltip`): use `DialogTrigger` pattern. No custom portal, no manual focus trap, no manual `aria-*` that React Aria already sets.
- Always give accessible name: visible `Label`, or `aria-label` for icon-only buttons.
- No custom `div` with `role` and key handlers to fake a control. Use the React Aria component.
- Client Components only: React Aria components use hooks. Add `"use client"` in wrapper files, not whole pages.
- Do not fork or rewrite a `components/ui/*` wrapper to fix one-off style. Use `className` at call site.

Bad:

```tsx
<button disabled={saving} onClick={save} className="hover:bg-gray-100">
  Save
</button>

<label>Name</label>
<input value={name} onChange={(e) => setName(e.target.value)} />

<Select onChange={(v) => setRoom(v)}>
  {rooms.map((r, i) => <option key={i}>{r.roomNumber}</option>)}
</Select>
```

Good:

```tsx
<Button isDisabled={saving} onPress={save}>
  Save
</Button>

<TextField value={name} onChange={setName} isRequired>
  <Label>Name</Label>
  <Input />
  <FieldError />
</TextField>

<Select
  selectedKey={roomId}
  onSelectionChange={(key) => typeof key === "number" && setRoomId(key)}
>
  <Label>Room</Label>
  <SelectTrigger />
  <SelectContent items={rooms}>
    {(r) => <SelectItem id={r.id}>{r.roomNumber}</SelectItem>}
  </SelectContent>
</Select>
```

Verify wrapper names (`SelectTrigger`, `SelectContent`, `SelectItem`) against actual `components/ui/` exports. Examples illustrative. `Key` is `string | number`: narrow with `typeof`, no `as`.

## STRICT: Typography

Font sizes consistent. **Default text has no size class.** Size classes only for headings.

- Default text (body, paragraphs, labels, buttons, inputs, table cells, helper text, captions, badges): no `text-*` size class. Inherits root size.
- Never put `text-xs`, `text-sm`, `text-base` or any size class on default text.
- Banned everywhere: `text-xs`, `text-base`, arbitrary sizes (`text-[13px]`, `text-[0.7rem]`), inline `fontSize`, `text-[length:...]`.
- Size classes allowed on headings only, from the list below.
- Headings by level:
    - `h1`: `text-4xl`
    - `h2`: `text-3xl`
    - `h3`: `text-2xl`
    - `h4`: `text-xl`
    - `h5`: `text-lg`
    - `h6`: no size class, `font-semibold`
- Heading size matches heading level. Do not pick `h3` for looks and restyle it. Pick the correct level, use its size.
- Hierarchy among same-size text: use `font-medium` / `font-semibold` and `text-muted-foreground`. Not a smaller size.
- Responsive size variants only from heading list (`text-3xl md:text-4xl`).
- Unsized text inherits root size. Do not add `text-sm`/`text-base` to `<body>`, root layout, or wrappers to set it. Change root size only if human asks.

Bad:

```tsx
<h1 className="text-xl">Incidents</h1>
<p className="text-xs text-gray-500">Last updated today</p>
<span className="text-base">Open</span>
<span className="text-sm">Room 204</span>
<span className="text-[13px]">Room 205</span>
```

Good:

```tsx
<h1 className="text-4xl font-semibold">Incidents</h1>
<p className="text-muted-foreground">Last updated today</p>
<span>Open</span>
<span>Room 204</span>
```

## STRICT: Icons (`lucide-react`)

Only icon library: `lucide-react`. Package name is `lucide-react`, not `react-lucide`.

**Use icons sparingly. Text first.** Default is no icon.

- No icons on headings, card titles, form labels, table headers, nav items that already have text, or buttons that already have text.
- No decorative icons to fill space or "make it look nicer".
- Icon allowed only when: icon-only action in tight space (delete, close, menu, expand), or standard control affordance (chevron on select, close on dialog, spinner).
- Never add icon beside existing text unless task asks for it.
- Status shown with text (`Badge` or label), not icon.

- No other icon lib (`react-icons`, `@heroicons/react`, FontAwesome, etc). No new icon dependency.
- No hand-written inline `<svg>` or image file for an icon that Lucide already has. Custom SVG only for brand/logo with no Lucide match.
- Named imports only: `import { Plus, Trash2 } from "lucide-react"`.
- No `import * as Icons from "lucide-react"`. No lookup by string (`Icons[name]`). Breaks tree-shaking, bloats bundle.
- Icon chosen by data: avoid. Use text. If unavoidable, map enum to icon in explicit `Record`, importing each icon by name.
- Name convention: follow repo (`Trash2` or `Trash2Icon`). Do not mix both styles.
- Size and color via Tailwind `className` (`size-4`, `text-muted-foreground`). No `size`/`color`/`strokeWidth` props unless repo already uses them. Icons inherit `currentColor`.
- Inside shadcn `Button` wrapper: check if wrapper already sizes child `svg`. If yes, do not add size class.
- Icon-only button: put `aria-label` on the `Button`. Icon alone gives no accessible name.
- Decorative icon next to text: add `aria-hidden="true"`. Meaningful standalone icon: give label via parent.
- Do not convey status by icon or color alone. Pair with text.
- Icons are safe in Server Components. Do not add `"use client"` just for an icon.

Bad:

```tsx
import * as Icons from "lucide-react";
import { FaTrash } from "react-icons/fa";

<button onClick={remove}>
  <Icons.Trash2 size={16} color="red" />
</button>

<Icons[incident.icon] />
```

Good:

```tsx
import { Trash2 } from "lucide-react";

<Button isIconOnly aria-label="Delete incident" onPress={remove}>
  <Trash2 className="size-4" aria-hidden="true" />
</Button>

<Button onPress={save}>Save</Button>

<Badge>{incident.status}</Badge>
```

Icon only on icon-only action. Text button and status stay text.

Bad (icon overuse):

```tsx
<h2 className="text-3xl"><Folder className="size-6" /> Incidents</h2>
<Button onPress={save}><Save className="size-4" /> Save</Button>
<span><CheckCircle2 className="size-4" /> Resolved</span>
```

Verify `isIconOnly` exists on the wrapper `Button`. Drop it if not. `Badge` wrapper name illustrative.

## Examples: Bad vs Good

### Structure

Bad: page fetches inline, raw `fetch`, hardcoded URL, UI mixed with data logic.

```tsx
export default async function Page() {
  const res = await fetch("http://localhost:8080/api/incidents?page=0");
  const data = await res.json();
  return (
    <div>
      {data.content.map((i: any) => (
        <div key={i.id} style={{ padding: 8 }}>
          <b>{i.incidentNumber}</b> {i.status}
        </div>
      ))}
    </div>
  );
}
```

Good: thin page, API layer, typed, separate component.

```tsx
// src/app/incidents/page.tsx
import { getIncidents } from "@/lib/api/incidents";
import { IncidentList } from "@/components/incidents/incident-list";

export default async function IncidentsPage() {
  const incidents = await getIncidents({ page: 1 });
  return <IncidentList incidents={incidents.content} />;
}
```

```ts
// src/lib/api/incidents.ts
export async function getIncidents(params: { page: number }): Promise<Page<Incident>> {
  return apiFetch<Page<Incident>>(`/api/incidents?page=${params.page}`);
}
```

### Control Flow

Bad: nested ifs, ternary chain, missing error and empty state.

```tsx
function IncidentList({ incidents, loading, error }: Props) {
  return (
    <div>
      {loading ? <Spinner /> : error ? <p>Error</p> : incidents ? incidents.length > 0 ? (
        incidents.map((i) => <IncidentCard key={i.id} incident={i} />)
      ) : null : null}
    </div>
  );
}
```

Good: early returns, all states handled, flat.

```tsx
function IncidentList({ incidents, loading, error }: Props) {
  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error.message} />;
  if (incidents.length === 0) return <EmptyState label="No incidents" />;

  return (
    <ul>
      {incidents.map((i) => (
        <IncidentCard key={i.id} incident={i} />
      ))}
    </ul>
  );
}
```

### Logic

Bad: magic strings, repeated checks, wrong pagination base, state mutation, filter logic duplicated in JSX.

```tsx
const [items, setItems] = useState<Incident[]>([]);

function resolve(i: Incident) {
  i.status = "resolved";
  setItems(items);
}

<span className={i.status == "OPEN" ? "text-red-500" : i.status == "RESOLVED" ? "text-green-500" : "text-gray-500"}>
  {i.status}
</span>

<button onClick={() => load(page - 1)}>Prev</button>
```

Good: enum from `types/`, lookup map, immutable update, 1-based page guard.

```tsx
const statusStyle: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "text-red-500",
  [IncidentStatus.RESOLVED]: "text-green-500",
  [IncidentStatus.CLOSED]: "text-gray-500",
};

setItems((prev) =>
  prev.map((i) => (i.id === id ? { ...i, status: IncidentStatus.RESOLVED } : i))
);

<span className={statusStyle[i.status]}>{i.status}</span>

<Button isDisabled={page <= 1} onPress={() => load(page - 1)}>Prev</Button>
```

Verify real enum values from backend `Models.Enums` before using. Example values above are illustrative.

## Naming and Style

- Components: `PascalCase`. Files: match existing repo convention.
- Hooks: `useX`. Functions/variables: `camelCase`. Types/interfaces: `PascalCase`.
- Small components, single responsibility. Split when file hard to read, not before.
- Prefer early returns over nested conditionals.

## Environment

- API base URL from env var (`NEXT_PUBLIC_API_URL` or existing name in repo). No hardcoded URLs.
- Never commit `.env*` or secrets.

## Before Finishing a Task

- Run type check, lint, build. All pass.
- Test the changed flow against running backend.
- Check list of files changed — only task-related files.
- Summarize what changed and anything uncertain. Do not claim untested work works.

## Ask First When

- Endpoint, DTO field, or enum not found in backend.
- Task needs new dependency, new global state pattern, or role/permission decision.
- Change would touch auth flow or API layer shape.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
