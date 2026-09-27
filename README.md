# DancePlay

DancePlay is a dance-learning and tracking application organized as a two-workspace monorepo:

- `client/` — Vue 3, Quasar, TypeScript, Vite, Pinia, and Axios frontend.
- `server/` — lightweight Laravel patch containing the custom API route and controller. It is currently an **unhydrated Laravel patch**, not a complete Laravel installation.

## 1. Architecture

```text
Quasar client
    |
    | Axios requests through /api proxy
    v
Laravel runtime generated locally from server/ patch
    |
    v
MySQL and Laravel storage
```

The client provides the navigation shell, dashboard, discover view, favorites, dance collection, progress tracking, cover-art fallbacks, add/edit/delete flows, and backend connectivity check.

## 2. Repository layout

```text
.
├── client/              # Quasar/Vue application
├── server/              # Laravel patch files
├── setup-backend.ps1    # Windows backend preparation workflow
├── .gitignore
└── README.md
```

The committed `server/` directory intentionally excludes Laravel framework boilerplate and Composer's `vendor/` directory. Use the setup workflow to hydrate a runnable Laravel installation locally.

## 3. Prerequisites

Install the following before setup:

- Git
- Node.js and npm
- PHP 8.2 or newer
- Composer
- MySQL, or another database configured in the generated Laravel application's `.env`
- PowerShell when using `setup-backend.ps1`

## 4. Backend setup

From the repository root, run the preparation script:

```powershell
.\setup-backend.ps1
```

The script temporarily moves the patch, creates a Composer-generated Laravel application, and copies the custom route and controller into it. Review the script output and configure the generated Laravel application's `.env` using `server/.env.example` as the reference.

The expected local database values are:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=danceplay
DB_USERNAME=root
DB_PASSWORD=
```

After the Laravel runtime is available:

```powershell
cd server
php artisan key:generate
php artisan migrate
php artisan serve
```

If the generated Laravel project is kept under a temporary directory, run the Artisan commands from that directory instead.

## 5. Frontend setup and scripts

Install dependencies:

```powershell
cd client
npm install
```

Available scripts:

```powershell
npm run dev
npm run build
npm run lint
```

Run `npm run dev` in a separate terminal while Laravel is serving the API. Quasar opens the development server and proxies `/api` requests to `http://127.0.0.1:8000` as configured in `client/quasar.config.ts`.

## 6. Running both workspaces

Terminal 1 — Laravel:

```powershell
cd server
php artisan serve
```

Terminal 2 — Quasar:

```powershell
cd client
npm run dev
```

Open the URL printed by Quasar. Use the **Test Backend** action on the home view to verify the client-to-server connection.

## 7. API contracts

### Implemented handshake

The current Laravel patch implements:

```text
GET /api/hello
```

Response:

```json
{
  "message": "Hello from Jashen Loberanes!"
}
```

The endpoint is implemented by `server/routes/api.php` and `server/app/Http/Controllers/Api/HelloController.php`.

### Expected dance contracts

The client service layer is prepared for the following endpoints, but the current committed server patch does not yet implement them:

```text
GET    /api/dances
POST   /api/dances
POST   /api/dances/{id}   # multipart form data with _method=PATCH
DELETE /api/dances/{id}
```

Expected dance payload fields include:

```text
id, title, artist, category, difficulty, status, progress,
favorite, cover_image, source_link, upload_link, notes,
created_at, updated_at
```

The client normalizes snake_case API fields such as `cover_image` and `source_link` into its TypeScript model.

## 8. Data, storage, and assets

The client uses:

- `client/public/*.jpg` for seeded cover artwork.
- `client/public/default-cover-*.svg` for deterministic fallback artwork.
- Multipart `cover_image` payloads for future server-backed uploads.
- `/storage/` paths and remote HTTP(S) URLs when supplied by an API response.

No database migrations, Eloquent models, or upload controller are currently committed in `server/`. Those belong to the future dance CRUD and media-storage milestone.

Never commit private `.env` files, `node_modules/`, Composer `vendor/`, build output, Laravel caches, or logs.

## 9. Development and verification

Before opening a pull request:

```powershell
cd client
npm run lint
npm run build
```

When a hydrated Laravel application is available, also run its test suite:

```powershell
php artisan test
```

Verify the handshake directly at `http://127.0.0.1:8000/api/hello` and verify that the Quasar proxy can reach the same endpoint through the **Test Backend** button.

## 10. Contribution and commit standards

Use focused, reviewable branches and strict Conventional Commits:

```text
type(scope): imperative subject
```

Examples:

```text
feat(client): add dance editor validation
feat(server): implement dance CRUD endpoints
fix(client): preserve cover image on update
docs(repo): clarify local setup
chore(infrastructure): update backend preparation workflow
```

Keep the subject imperative and under 72 characters. Use the commit body for architectural context, behavior changes, validation details, and migration or deployment notes. Separate backend, frontend, infrastructure, and documentation concerns when they can be reviewed independently.
