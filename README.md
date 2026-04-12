# FamilyHub

A lightweight, self-hosted family dashboard for tracking household items, managing shared tasks, and keeping everything organised in one place.

Built with **vanilla JavaScript ES modules** on the frontend and a minimal **Node.js / Express** backend. No build step. No database — data lives in a single JSON file.

---

## Features

- **Tasks** (default view) — time-aware greeting + shared to-do list with filters, priority, assignee and due date. Lands first on open.
- **Entities** — grid of all entities (Home, Car, Dog, etc.) with colour-coded status summaries. Each entity is organised into custom sections (e.g. Home → Maintenance, Appliances, Garden).
- **Items** — track individual things within a section with three statuses:
  - 🟢 **All good**
  - 🟡 **Needs attention**
  - 🔴 **Urgent**
- **Tasks** — shared to-do list with optional priority (low / medium / high), optional entity link, optional assignee, and optional due date (with time). Filter by to do / done / all. Supports **recurring tasks** (daily, weekly, biweekly, monthly, every 3/6 months, yearly, or fully custom interval) — completing a recurring task marks it done and automatically creates the next occurrence.
- **Drag-and-drop reordering** — sections and items within a section can be reordered by dragging; works on both desktop and mobile.
- **Item detail view** — tapping an item opens a read-only detail modal showing the full name and notes, useful on small screens.
- **Full CRUD** — add, edit, and delete entities, sections, items, and tasks through modals.
- **i18n** — English / Lithuanian language toggle in the header; choice persisted in `localStorage`.
- **PWA** — installable on iPhone/Android; service worker caches the app shell for offline use.
- **Responsive** — desktop top-nav, mobile bottom-nav.

---

## Tech stack

| Layer       | Technology                                                       |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | Vanilla JS (ES modules), HTML5, CSS3                             |
| Backend     | Node.js 20, Express 4, TypeScript                                |
| ORM         | TypeORM 0.3 (migrations, typed entities)                         |
| Database    | PostgreSQL 16                                                    |
| Containers  | Docker + Docker Compose                                          |
| Routing     | Hash-based client-side SPA (`#/`, `#/entities`, `#/entity/:id`) |

Zero frontend dependencies.

---

## Project structure

```
├── index.html              # App shell (single HTML file)
├── manifest.json           # PWA manifest (name, icons, display mode)
├── sw.js                   # Service worker (cache-first for assets, network-first for API)
├── Dockerfile              # Multi-stage build (builder → production)
├── docker-compose.yml      # PostgreSQL + app containers
├── .env.example            # Environment variable template
├── .gitignore
├── package.json
├── icons/
│   ├── icon.svg            # Source icon
│   ├── icon-180.png        # Apple touch icon (generated)
│   ├── icon-192.png        # Android / Chrome PWA icon (generated)
│   ├── icon-512.png        # Android splash icon (generated)
│   └── generate.mjs        # One-time script to (re)generate PNG icons
├── css/
│   ├── base.css            # CSS variables, reset
│   ├── layout.css          # Header, main, nav
│   ├── components.css      # Cards, badges, buttons
│   ├── tasks.css           # Task list styles
│   ├── modal.css           # Modal overlay
│   └── responsive.css      # Mobile breakpoints
├── js/
│   ├── main.js             # Entry point — bootstraps the app
│   ├── state.js            # In-memory state store
│   ├── api.js              # Fetch wrapper for all REST calls
│   ├── render.js           # Route → view dispatcher
│   ├── router.js           # Hash URL parser
│   ├── events.js           # Delegated click & change handlers
│   ├── modal.js            # Modal open/close logic
│   ├── helpers.js          # Escape, greetingKey utils
│   ├── i18n.js             # EN/LT translations + t() helper
│   ├── labels.js           # Status/priority labels & CSS classes
│   ├── data.js             # Default seed data
│   ├── views/
│   │   ├── dashboard.js    # Entities view renderer (entity grid + status cards)
│   │   ├── entity.js       # Entity detail page renderer
│   │   └── tasks.js        # Tasks page renderer
│   └── modals/
│       ├── entities.js     # Add/edit entity & section modals
│       ├── items.js        # Add/edit item modals
│       └── tasks.js        # Add/edit task modals
└── server/
    ├── tsconfig.json       # TypeScript config for the server (compiled → dist/)
    └── src/
        ├── index.ts        # Express app setup, startup, migration runner
        ├── data-source.ts  # TypeORM DataSource (connection + entity/migration list)
        ├── utils.ts        # uid() — crypto.randomUUID() wrapper
        ├── entity/
        │   ├── FamilyEntity.ts  # entities table
        │   ├── Section.ts       # sections table (sort_order, FK → entities)
        │   ├── Item.ts          # items table (sort_order)
        │   └── Task.ts          # tasks table (created_at for ordering)
        ├── migrations/
        │   └── 1744408800000-InitialSchema.ts  # creates all four tables
        └── routes/
            ├── entities.ts # /api/entities (+ /sections sub-resource)
            ├── items.ts    # /api/items
            └── tasks.ts    # /api/tasks
```

---

## Getting started

### Option A — Docker (recommended)

The simplest way. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone <your-repo-url>
cd Family

# 1. Create your environment file
cp .env.example .env
#    Edit .env and set a real DB_PASSWORD

# 2. Start everything (builds the image, starts postgres + app)
docker compose up --build
```

Open **http://localhost:3000**. The database schema is created automatically on first run.

To stop: `docker compose down`. Data persists in the `postgres_data` Docker volume.
To wipe data and start fresh: `docker compose down -v`.

---

### Option B — local development (no Docker)

Requires [Node.js](https://nodejs.org/) 20+ and a running PostgreSQL instance.

```bash
git clone <your-repo-url>
cd Family
npm install

# 1. Create your environment file
cp .env.example .env
#    Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME to match your local Postgres

# 2. Start with auto-restart on file change
npm run dev:watch

# Or start once
npm run dev
```

Open **http://localhost:3000**. Migrations run automatically on startup.

---

### Building for production (outside Docker)

```bash
npm run build   # compiles server/src/ → dist/
npm start       # runs dist/index.js
```

### Custom port

```bash
PORT=8080 npm start
# or set PORT in .env
```

---

## Installing as a mobile app (PWA)

FamilyHub is a Progressive Web App — you can install it on your iPhone home screen and it will feel like a native app.

### One-time icon generation

After cloning, generate the PNG icons from the SVG source:

```bash
node icons/generate.mjs
```

This creates `icons/icon-180.png`, `icon-192.png`, and `icon-512.png`. You only need to re-run this if you change `icons/icon.svg`.

### Add to iPhone home screen

1. Start the server: `npm start`
2. Make sure your phone is on the same Wi-Fi as your Mac
3. Find your Mac's local IP (`System Settings → Wi-Fi → Details`)
4. Open **Safari** on iPhone → go to `http://<mac-ip>:3000`
5. Tap the **Share** button → **Add to Home Screen** → **Add**

The app installs with the purple house icon and opens fullscreen with no browser chrome.

### Updating the app

After deploying code changes, bump `CACHE_NAME` in `sw.js` (e.g. `familyhub-v2`). This tells users' devices to fetch fresh files automatically on next open.

---

## Migrations

Schema changes are managed with TypeORM migrations — never `synchronize: true`.

```bash
# Apply all pending migrations (also runs automatically on startup)
npm run migration:run

# Roll back the last migration
npm run migration:revert

# Generate a new migration after changing an entity file
npm run migration:generate -- src/migrations/MyChange
```

Migrations live in `server/src/migrations/` and are imported directly into `data-source.ts`, so they work identically with ts-node (dev) and compiled JS (prod).

---

## Data model

All data is stored in PostgreSQL. The schema is managed by migrations:

```jsonc
{
  "entities": [
    {
      "id": "home",
      "name": "Home",
      "emoji": "🏠",
      "sections": [{ "id": "maintenance", "name": "Maintenance" }],
    },
  ],
  "items": [
    {
      "id": "<uid>",
      "entityId": "home",
      "sectionId": "maintenance",
      "name": "Roof inspection",
      "status": "urgent", // "ok" | "soon" | "urgent"
      "notes": "Due this spring",
    },
  ],
  "tasks": [
    {
      "id": "<uid>",
      "name": "Book a roof inspector",
      "entityId": "home", // nullable
      "priority": "high", // "low" | "medium" | "high" | null (no priority)
      "done": false,
      "assignedTo": "",
      "dueDate": null, // "YYYY-MM-DD" | "YYYY-MM-DDTHH:MM" | null
      "repeat": null, // "daily" | "weekly" | "biweekly" | "monthly" | "3months" | "6months" | "yearly" | "custom" | null
      "repeatEvery": null, // number — used when repeat is "custom" (e.g. 3)
      "repeatFrequency": null, // "days" | "weeks" | "months" | "years" — used when repeat is "custom"
    },
  ],
}
```

The schema is created by the initial migration on first startup. To seed data manually, connect to the database while the server is stopped and insert rows directly, or use the app UI.

---

## REST API

Base URL: `http://localhost:3000/api`

| Method   | Endpoint                         | Description                                                                                                  |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/data`                          | Load full snapshot (used on app startup)                                                                     |
| `GET`    | `/entities`                      | List all entities                                                                                            |
| `POST`   | `/entities`                      | Create entity `{ name, emoji? }`                                                                             |
| `PUT`    | `/entities/:id`                  | Update entity                                                                                                |
| `DELETE` | `/entities/:id`                  | Delete entity + its items                                                                                    |
| `POST`   | `/entities/:id/sections`         | Add section `{ name }`                                                                                       |
| `PUT`    | `/entities/:id/sections/:sid`    | Rename section                                                                                               |
| `DELETE` | `/entities/:id/sections/:sid`    | Delete section + its items                                                                                   |
| `PUT`    | `/entities/:id/sections/reorder` | Reorder sections `{ ids: [...] }`                                                                            |
| `PUT`    | `/items/reorder`                 | Reorder items within a section `{ entityId, sectionId, ids: [...] }`                                         |
| `GET`    | `/items`                         | List all items                                                                                               |
| `POST`   | `/items`                         | Create item `{ entityId, sectionId, name, status?, notes? }`                                                 |
| `PUT`    | `/items/:id`                     | Update item fields                                                                                           |
| `DELETE` | `/items/:id`                     | Delete item                                                                                                  |
| `GET`    | `/tasks`                         | List all tasks                                                                                               |
| `POST`   | `/tasks`                         | Create task `{ name, entityId?, priority?, assignedTo?, dueDate?, repeat?, repeatEvery?, repeatFrequency? }` |
| `PUT`    | `/tasks/:id`                     | Update task fields                                                                                           |
| `DELETE` | `/tasks/:id`                     | Delete task                                                                                                  |

All endpoints accept and return JSON.

---

## Architecture

```
Browser                              Server (Express / TypeScript)
──────────────────────────────────   ────────────────────────────────────────
main.js (init)
  └─ state.js ──── GET /api/data ──► index.ts
  └─ render.js                         └─ data-source.ts (TypeORM DataSource)
       └─ router.js (hash → view)            └─ PostgreSQL
       └─ views/ (HTML strings)
  └─ events.js (delegated handlers)
       └─ api.js ──── REST calls ───► routes/ (async CRUD via TypeORM repos)
       └─ modals/
```

Key design decisions:

- **Optimistic UI**: state is updated in memory immediately on user action; the API call fires in the background. This makes the UI feel instant even on slow localhost.
- **Event delegation**: a single click handler on `#view` dispatches all actions via `data-action` attributes — no per-element listeners.
- **No virtual DOM**: views return plain HTML strings and are re-rendered in full via `innerHTML`. This is fast enough for the data volumes involved and keeps the code simple.
- **PostgreSQL + TypeORM**: all data is persisted in a proper relational database. TypeORM entities map directly to tables; `sort_order` columns preserve drag-and-drop order for sections and items; `created_at` on tasks provides stable newest-first ordering.
- **Migrations over synchronize**: `synchronize: false` is enforced. Schema changes are always done through versioned migration files, making it safe to evolve the schema in production without data loss.
- **Automatic migration runner**: `AppDataSource.runMigrations()` is called at startup before the HTTP server binds, so the schema is always up to date when the app becomes reachable.
