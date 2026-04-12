# FamilyHub

A lightweight, self-hosted family dashboard for tracking household items, managing shared tasks, and keeping everything organised in one place.

Built with **vanilla JavaScript ES modules** on the frontend and a **Node.js / Express / TypeScript** backend backed by PostgreSQL.

---

## Features

- **Tasks** — shared to-do list with filters, priority, assignee, and due date. Time-aware greeting on open.
- **Recurring tasks** — daily, weekly, biweekly, monthly, every 3/6 months, yearly, or fully custom interval. Completing a recurring task marks it done and automatically creates the next occurrence.
- **Entities** — grid of household things (Home, Car, Dog, etc.) with colour-coded status summaries. Each entity has custom sections (e.g. Home → Maintenance, Appliances).
- **Items** — track things within a section with three statuses: 🟢 All good · 🟡 Needs attention · 🔴 Urgent.
- **User authentication** — JWT-based login with persistent sessions (stored in `localStorage`). All data routes require a valid token.
- **Admin panel** — password-protected at `#/admin` (uses `ADMIN_PASSWORD` env var, cleared on page refresh). Create, delete, and change passwords for users.
- **Push notifications** — users can subscribe their device via the 🔔 bell in the header. Admins can send test pushes per user from the admin panel. Works on desktop browsers, Android Chrome, and iOS Safari 16.4+ (PWA must be added to Home Screen on iOS).
- **Drag-and-drop reordering** — sections and items reorder by drag on desktop and touch on mobile.
- **i18n** — English / Lithuanian toggle in the header; persisted in `localStorage`.
- **PWA** — installable on iPhone/Android; service worker caches the app shell for offline use.
- **Responsive** — desktop top-nav, mobile bottom-nav.

---

## Tech stack

| Layer       | Technology                                                                         |
| ----------- | ---------------------------------------------------------------------------------- |
| Frontend    | Vanilla JS (ES modules), HTML5, CSS3                                               |
| Backend     | Node.js 20, Express 4, TypeScript                                                  |
| Auth        | JWT (jsonwebtoken), bcrypt, Web Push (web-push + VAPID)                            |
| ORM         | TypeORM 0.3 (migrations, typed entities)                                           |
| Database    | PostgreSQL 16                                                                      |
| Containers  | Docker + Docker Compose                                                            |
| Routing     | Hash-based client-side SPA (`#/`, `#/entities`, `#/entity/:id`, `#/admin`)        |

Zero frontend dependencies.

---

## Project structure

```
├── index.html              # App shell (single HTML file)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first assets, network-first API, push handler)
├── Dockerfile              # Multi-stage build (builder → production)
├── docker-compose.yml      # PostgreSQL + app containers
├── .env.example            # Environment variable template
├── package.json
├── icons/
│   ├── icon.svg            # Source icon
│   ├── icon-180.png        # Apple touch icon
│   ├── icon-192.png        # Android / Chrome PWA icon
│   ├── icon-512.png        # Android splash icon
│   └── generate.mjs        # One-time script to (re)generate PNG icons
├── css/
│   ├── base.css            # CSS variables, reset
│   ├── layout.css          # Header, main, nav
│   ├── components.css      # Cards, badges, buttons
│   ├── tasks.css           # Task list styles
│   ├── modal.css           # Modal overlay
│   ├── responsive.css      # Mobile breakpoints
│   └── auth.css            # Login screen, admin page, push/logout buttons
├── js/
│   ├── main.js             # Entry point — bootstraps app, wires auth + push + nav
│   ├── state.js            # In-memory state store
│   ├── api.js              # Fetch wrapper for all REST calls
│   ├── auth.js             # JWT token helpers (localStorage)
│   ├── push.js             # Web Push subscribe/unsubscribe helpers
│   ├── render.js           # Route → view dispatcher (auth-aware)
│   ├── router.js           # Hash URL parser
│   ├── events.js           # Delegated click & change handlers
│   ├── modal.js            # Modal open/close logic
│   ├── helpers.js          # esc(), greetingKey() utils
│   ├── i18n.js             # EN/LT translations + t() helper
│   ├── labels.js           # Status/priority labels & CSS classes
│   ├── data.js             # Default seed data
│   ├── views/
│   │   ├── login.js        # Login screen renderer
│   │   ├── admin.js        # Admin panel renderer + event wiring
│   │   ├── dashboard.js    # Entities view renderer
│   │   ├── entity.js       # Entity detail page renderer
│   │   └── tasks.js        # Tasks page renderer
│   └── modals/
│       ├── entities.js     # Add/edit entity & section modals
│       ├── items.js        # Add/edit item modals
│       └── tasks.js        # Add/edit task modals
└── server/
    ├── tsconfig.json
    └── src/
        ├── index.ts        # Express app setup, VAPID config, startup
        ├── data-source.ts  # TypeORM DataSource
        ├── utils.ts        # uid() helper
        ├── entity/
        │   ├── FamilyEntity.ts
        │   ├── Section.ts
        │   ├── Item.ts
        │   ├── Task.ts
        │   ├── User.ts              # users table (username, bcrypt hash)
        │   └── PushSubscription.ts  # push_subscriptions table (per-device, FK → users)
        ├── migrations/
        │   ├── 1744408800000-InitialSchema.ts
        │   ├── 1744408800001-AddUsers.ts
        │   └── 1744408800002-AddPushSubscriptions.ts
        ├── middleware/
        │   └── auth.ts     # authMiddleware (JWT), adminMiddleware (header password)
        └── routes/
            ├── auth.ts     # POST /api/auth/login, /api/auth/admin-login
            ├── admin.ts    # /api/admin/users (CRUD) + /api/admin/push-test/:id
            ├── push.ts     # /api/push/subscribe, /api/push/vapid-public-key
            ├── entities.ts
            ├── items.ts
            └── tasks.ts
```

---

## Getting started

### 1. Environment file

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable           | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `DB_PASSWORD`      | PostgreSQL password                                                  |
| `JWT_SECRET`       | Long random string for signing JWTs                                  |
| `ADMIN_PASSWORD`   | Password for the `/admin` panel (not stored in the DB)               |
| `VAPID_PUBLIC_KEY` | VAPID public key for Web Push (generate once — see below)            |
| `VAPID_PRIVATE_KEY`| VAPID private key                                                    |
| `VAPID_EMAIL`      | Contact email sent in push requests (e.g. `mailto:you@example.com`) |

**Generate VAPID keys once** (only needs to be done once per deployment):

```bash
npx web-push generate-vapid-keys
```

Copy the output into `.env`. If you regenerate these keys, all existing push subscriptions become invalid and users will need to re-subscribe.

---

### Option A — Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# Start everything (builds the image, starts postgres + app)
docker compose up --build
```

Open **http://localhost:3000**. The database schema is created automatically on first run.

```bash
docker compose down        # stop (data preserved in postgres_data volume)
docker compose down -v     # stop and wipe all data
```

---

### Option B — local development (no Docker)

Requires [Node.js](https://nodejs.org/) 20+ and a running PostgreSQL instance.

```bash
npm install

# Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env to match your local Postgres

npm run dev:watch   # auto-restart on file changes
# or
npm run dev
```

Open **http://localhost:3000**.

---

### Building for production (outside Docker)

```bash
npm run build   # compiles server/src/ → dist/
npm start       # runs dist/index.js
```

---

## First-time setup

After the server starts for the first time, there are no users — you'll see the login screen. Use the admin panel to create the first user:

1. Go to **http://localhost:3000/#/admin**
2. Enter the `ADMIN_PASSWORD` from your `.env`
3. Create a user with a username and password
4. Go to **http://localhost:3000** and log in

---

## Push notifications

Push notifications use the [Web Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) standard (VAPID). No third-party service required.

**Browser support:**
- ✅ Desktop: Chrome, Firefox, Edge, Safari 16+
- ✅ Android: Chrome
- ✅ iOS: Safari 16.4+ — **but only when the PWA is added to the Home Screen**

**Subscribing:** After logging in, tap the 🔔 bell button in the header. The browser will ask for permission. The icon fills in when subscribed; tap again to unsubscribe.

**Testing from admin panel:** In `#/admin`, users with active subscriptions show a 🔔 **Send test** button. Clicking it sends a test notification to all their subscribed devices.

Multiple devices with the same account each register their own subscription — all receive notifications independently.

---

## Installing as a mobile app (PWA)

### One-time icon generation

```bash
node icons/generate.mjs
```

### Add to iPhone home screen

1. Open **Safari** on iPhone → go to `http://<server-ip>:3000`
2. Tap **Share** → **Add to Home Screen** → **Add**

The app opens fullscreen. Push notifications require this step on iOS.

---

## Migrations

Schema changes use TypeORM migrations — `synchronize: false` is enforced.

```bash
# Apply pending migrations (also runs automatically on startup)
npm run migration:run

# Roll back the last migration
npm run migration:revert

# Generate a new migration after changing an entity
npm run migration:generate -- src/migrations/MyChange
```

---

## Data model

| Table                | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `entities`           | Household entities (Home, Car, …)                         |
| `sections`           | Named groups within an entity, with `sort_order`          |
| `items`              | Tracked things within a section, with `sort_order`        |
| `tasks`              | Shared to-do items with optional repeat, priority, due date |
| `users`              | App users (username + bcrypt password hash)               |
| `push_subscriptions` | Per-device Web Push subscriptions (FK → users, cascade delete) |

---

## REST API

All protected endpoints require `Authorization: Bearer <token>`. Admin endpoints require `X-Admin-Password` header.

**Auth**

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| `POST` | `/api/auth/login`         | `{ username, password }` → `{ token }` |
| `POST` | `/api/auth/admin-login`   | `{ password }` → `{ ok: true }`    |

**Admin** *(X-Admin-Password required)*

| Method   | Endpoint                      | Description                        |
| -------- | ----------------------------- | ---------------------------------- |
| `GET`    | `/api/admin/users`            | List users (includes `hasPush` flag) |
| `POST`   | `/api/admin/users`            | Create user `{ username, password }` |
| `PUT`    | `/api/admin/users/:id/password` | Change password `{ password }`    |
| `DELETE` | `/api/admin/users/:id`        | Delete user + their subscriptions  |
| `POST`   | `/api/admin/push-test/:id`    | Send test push to user's devices   |

**Push** *(subscribe/unsubscribe require Bearer token)*

| Method   | Endpoint                    | Description                        |
| -------- | --------------------------- | ---------------------------------- |
| `GET`    | `/api/push/vapid-public-key`| Returns VAPID public key           |
| `POST`   | `/api/push/subscribe`       | Save push subscription             |
| `DELETE` | `/api/push/subscribe`       | Remove push subscription           |

**Data** *(all require Bearer token)*

| Method   | Endpoint                             | Description                             |
| -------- | ------------------------------------ | --------------------------------------- |
| `GET`    | `/api/data`                          | Full snapshot (startup)                 |
| `POST`   | `/api/entities`                      | Create entity                           |
| `PUT`    | `/api/entities/:id`                  | Update entity                           |
| `DELETE` | `/api/entities/:id`                  | Delete entity                           |
| `POST`   | `/api/entities/:id/sections`         | Add section                             |
| `PUT`    | `/api/entities/:id/sections/:sid`    | Rename section                          |
| `DELETE` | `/api/entities/:id/sections/:sid`    | Delete section                          |
| `PUT`    | `/api/entities/:id/sections/reorder` | Reorder sections `{ ids }`              |
| `PUT`    | `/api/items/reorder`                 | Reorder items `{ entityId, sectionId, ids }` |
| `POST`   | `/api/items`                         | Create item                             |
| `PUT`    | `/api/items/:id`                     | Update item                             |
| `DELETE` | `/api/items/:id`                     | Delete item                             |
| `POST`   | `/api/tasks`                         | Create task                             |
| `PUT`    | `/api/tasks/:id`                     | Update task                             |
| `DELETE` | `/api/tasks/:id`                     | Delete task                             |

---

## Architecture

```
Browser                                   Server (Express / TypeScript)
───────────────────────────────────────   ──────────────────────────────────────
main.js (init)
  ├─ auth.js (localStorage token)
  ├─ push.js (Web Push subscribe)
  ├─ state.js ──── GET /api/data ───────► index.ts
  └─ render.js (auth-aware dispatcher)       ├─ authMiddleware (JWT verify)
       ├─ router.js (hash → view)            ├─ adminMiddleware (header pw)
       ├─ views/login.js                     ├─ data-source.ts (TypeORM)
       ├─ views/admin.js                     │    └─ PostgreSQL
       └─ views/ (tasks, entities, entity)   └─ routes/
  └─ events.js (delegated handlers)               ├─ auth.ts
       └─ api.js ──── REST calls ──────────►      ├─ admin.ts
       └─ modals/                                  ├─ push.ts
                                                   ├─ entities.ts
                                                   ├─ items.ts
                                                   └─ tasks.ts
```

Key design decisions:

- **Auth-aware rendering**: `render.js` checks `isLoggedIn()` before dispatching to any view. Unauthenticated users always see the login screen (except `#/admin`, which has its own password gate).
- **Admin session in memory**: `adminPassword` is stored only in a JS module variable — never in `localStorage` or `sessionStorage`. A page refresh always clears it.
- **Optimistic UI**: state is updated in memory immediately; API calls fire in the background.
- **Event delegation**: a single click handler on `#view` dispatches all actions via `data-action` attributes.
- **No virtual DOM**: views return plain HTML strings rendered via `innerHTML`. Fast enough for the data volumes and keeps the code simple.
- **Migrations over synchronize**: `synchronize: false` enforced. All schema changes go through versioned migration files.
- **Push subscription cleanup**: when sending a push, expired subscriptions (HTTP 410/404 from the push service) are automatically deleted.
