# ToDoList

A task manager built as two separate applications: an ASP.NET Core REST API backed by
MySQL, and a React frontend that talks to it over HTTP.

Create tasks, edit them, tick them off, delete them, and filter by completed/active.

---

## Running it

Two terminals, both must be running.

**Backend** — from `Backend/`:

```bash
cp appsettings.example.json appsettings.json   # then edit in your MySQL password
dotnet ef database update                      # first time only, creates the schema
dotnet run                                     # → http://localhost:5000
```

`appsettings.json` holds the database password and is deliberately not committed.
Copy the example file and fill in your own connection string.

**Frontend** — from `Frontend/`:

```bash
npm install                  # first time only
npm run dev                  # → http://localhost:5173
```

Then open <http://localhost:5173>.

Other useful commands, from `Frontend/`:

```bash
npx tsc --noEmit             # typecheck only; no output means clean
npm run build                # production build into dist/
```

---

## How the two halves fit together

```
Browser (localhost:5173)          Server (localhost:5000)
┌────────────────────┐            ┌──────────────────────┐
│ App.tsx            │            │ TaskController       │
│   ↓                │  HTTP +    │   ↓                  │
│ Api/client.ts      │───JSON────▶│ TaskService          │
│                    │◀───────────│   ↓                  │
└────────────────────┘            │ TaskRepository       │
                                  │   ↓                  │
                                  │ AppDbContext → MySQL │
                                  └──────────────────────┘
```

They are genuinely separate programs on different ports. That is why CORS exists in
this project (see below) — the browser will not let one origin read another's
responses without permission.

---

## The API

Base URL `http://localhost:5000`.

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `/api/tasks` | — | `TaskResponse[]` |
| GET | `/api/tasks?isCompleted=true` | — | only completed tasks |
| GET | `/api/tasks?isCompleted=false` | — | only active tasks |
| GET | `/api/tasks/{id}` | — | `TaskResponse` / 404 |
| POST | `/api/tasks` | `{ title, description }` | 201 + `TaskResponse` |
| PUT | `/api/tasks/{id}` | `{ id, title, description, isCompleted }` | 200 / 400 / 404 |
| DELETE | `/api/tasks/{id}` | — | 204 / 404 |

---

## Backend

```
Backend/
  Program.cs                     startup: DI registrations, CORS, middleware order
  Controller/TaskController.cs   HTTP layer — routes, status codes, no logic
  Services/TaskService.cs        business logic, entity ⇄ DTO mapping
  Repositories/TaskRepository.cs database queries
  Data/AppDbContext.cs           EF Core model: table, columns, indexes
  Domain/TaskEntity.cs           the database row
  DTOs/                          the shapes sent over the wire
  Migrations/                    generated schema history
```

Four layers, each depending on the interface below it rather than the concrete class.
Wired up in `Program.cs`:

```csharp
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();
```

**`TaskEntity` and `TaskResponse` are deliberately separate** even though they
currently hold identical fields. One is the database row, the other is the public API
shape. Keeping them apart means a new database column is not automatically exposed to
every client.

### CORS

The frontend runs on port 5173 and the API on 5000. Different port means different
origin, so the browser blocks the response unless the server opts in:

```csharp
policy.WithOrigins("http://localhost:5173")
      .AllowAnyHeader()
      .AllowAnyMethod();
```

Two things matter here:

- **`app.UseCors()` must come before `app.MapControllers()`.** Middleware runs in
  order; if the controller handles the request first, the CORS headers are never
  added. This is the usual reason "I added CORS and it still doesn't work."
- **No trailing slash** in the origin — `"http://localhost:5173/"` silently fails to match.

### The filter

`GET /api/tasks?isCompleted=true|false`, threaded through every layer as a nullable
`bool?`:

```csharp
var query = _context.Tasks.AsNoTracking();

if (isCompleted.HasValue)
{
    query = query.Where(t => t.IsCompleted == isCompleted.Value);
}
```

**`bool?` rather than `bool`** because three states are needed — true, false, and *not
specified*. A plain `bool` has only two, so an absent parameter would default to
`false` and silently return active tasks when the caller asked for everything.

Filtering runs in SQL, not in memory, and `AppDbContext` declares
`entity.HasIndex(t => t.IsCompleted)` so the query is indexed.

### PUT is a full replace

`UpdateTaskRequest` marks `Title` and `Description` as `[Required]`, and `[Required]`
rejects empty strings. So an update must send **every** field — this is not a partial
update. Ticking a checkbox means sending the whole task back with one field flipped.

The controller also rejects a mismatch between the route and the body:

```csharp
if (id != request.Id)
{
    return BadRequest("The id in the route does not match the id in the body.");
}
```

### Timestamps are forced to UTC

```csharp
CreatedAt = DateTime.SpecifyKind(task.CreatedAt, DateTimeKind.Utc),
```

MySQL returns `DateTime` values with `Kind=Unspecified`, which serialize *without* a
trailing `Z`. JavaScript parses a timestamp with no `Z` as **local** time, so dates
silently shifted by the user's UTC offset after a page refresh. Values are always
stored as UTC, so this states it explicitly.

---

## Frontend

Vite + React 19 + TypeScript + Tailwind v4.

```
Frontend/src/
  main.tsx                  mounts <App /> inside <StrictMode>
  App.tsx                   all state; loads data and owns the CRUD handlers
  Api/client.ts             every network call in the app
  Types/task.ts             types mirroring the C# DTOs
  Components/
    TaskForm.tsx            create form
    FilterBar.tsx           All / Active / Completed
    TaskItem.tsx            one row: checkbox, inline edit, delete
```

State lives in `App.tsx` and flows down as props. Components never call `fetch`
themselves — they call a handler passed in from above.

### Types mirror the C# DTOs

```ts
export interface Task {
    id: string;          // Guid       — no GUID type in JavaScript
    title: string;
    description: string;
    createdAt: string;   // DateTime   — a string, NOT a Date
    updatedAt: string;
    isCompleted: boolean;
}
```

Three conversions to be aware of:

- **`Guid` → `string`.** JavaScript has no GUID type.
- **`DateTime` → `string`, not `Date`.** `JSON.parse` does not build `Date` objects.
  Typing it as `Date` compiles fine and then throws at runtime. Convert at display
  time: `new Date(task.createdAt).toLocaleString()`.
- **`Title` → `title`.** ASP.NET camelCases property names on the way out. Writing
  `task.Title` in React yields `undefined` — no error, just a blank on screen.

Note that TypeScript is erased at compile time. `client.ts` *asserts* a response is a
`Task[]`; nothing checks it at runtime. The API boundary is the one place these types
are a hope rather than a fact — runtime validation (e.g. `zod`) is the proper fix if
this ever grows.

### The API client

One `request<T>` helper wraps `fetch` so base URL, headers, and error handling live in
one place. Two non-obvious details:

- **`fetch` does not throw on 404 or 500.** It rejects only on *network* failure. A
  clean 500 is, to `fetch`, a successful round trip — hence the explicit
  `if (!response.ok)` check.
- **The 204 branch exists for DELETE.** `NoContent()` returns a zero-length body, and
  `.json()` on an empty body throws. Without that branch a successful delete would
  look like a failure.

### Every mutation refetches the list

`App.tsx` reloads from the server after any create, update, or delete rather than
patching local state. Because filtering happens server-side, ticking a checkbox while
viewing "Active" must *remove* that task from the list — patching locally would mean
re-implementing the server's filter rule in the client, and the two would drift apart.
One extra GET buys that correctness.

The loading state is `loading && tasks.length === 0`, so only the very first load
blanks the page; later fetches keep the current list on screen instead of flashing.

### Configuration

`Frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

Only `VITE_`-prefixed variables are exposed to browser code. Anything with that prefix
is **compiled into the bundle and fully public** — configuration, never secrets. Vite
reads `.env` only at startup, so restart the dev server after changing it.

`vite.config.ts` sets `strictPort: true`. Without it, Vite quietly falls back to 5174
when 5173 is busy, and every API call then fails CORS — a confusing failure a long way
from its cause. `strictPort` makes Vite refuse to start instead.

---

## Gotchas

**React StrictMode fires effects twice in development.** You will see two identical
GET requests on load. That is intentional, dev-only, and gone in production builds.

**`verbatimModuleSyntax` is on.** Type imports must use `import type { ... }` or it is
a compile error.

**No `launchSettings.json`**, so the backend reports `Hosting environment: Production`
and shows no detailed error pages.

**The database password lives in `Backend/appsettings.json`**, which is gitignored for
that reason. `appsettings.example.json` is the committed template. For anything beyond
local development, use user secrets or environment variables rather than a file.
