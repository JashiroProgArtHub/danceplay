# DancePlay

DancePlay is a dance-learning and tracking application organized as a two-workspace monorepo:

- `frontend/` — Vue 3, Quasar, TypeScript, Vite, Pinia, and Axios frontend.
- `backend/` — Standard Laravel 12 API backend.

## 1. Architecture

```text
Quasar frontend
    |
    | Axios requests through /api proxy
    v
Laravel 12 API backend
    |
    v
MySQL database via XAMPP and Laravel storage
```

The frontend provides the navigation shell, dashboard, discover view, favorites, dance collection, progress tracking, cover-art fallbacks, add/edit/delete flows, and backend connectivity check.

## 2. Repository layout

```text
.
├── frontend/            # Quasar/Vue application
├── backend/             # Standard Laravel 12 API backend
├── setup-backend.ps1    # Windows backend preparation workflow
├── .gitignore
└── README.md
```

## 3. Prerequisites

Install the following before setup:

- Git
- Node.js and npm
- PHP 8.2 or newer
- Composer
- MySQL (via XAMPP), or another database configured in `backend/.env`
- PowerShell when using `setup-backend.ps1`

## 4. Backend setup

1. Run `setup-backend.ps1` from the repository root to install Composer dependencies, generate the app key, and link storage:

```powershell
.\setup-backend.ps1
```

2. Ensure MySQL is running on port 3306 (e.g. via XAMPP Control Panel).

3. Configure `backend/.env` with database credentials:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=danceplay
DB_USERNAME=root
DB_PASSWORD=
```

4. Run `php artisan migrate:fresh --seed` to build the database and populate default dances:

```powershell
cd backend
php artisan migrate:fresh --seed
```

5. Run `php artisan serve`:

```powershell
php artisan serve
```

## 5. Frontend setup and scripts

Install dependencies:

```powershell
cd frontend
npm install
```

Available scripts:

```powershell
npm run dev
npm run build
npm run lint
```

Run `npm run dev` in a separate terminal while the backend is serving the API. Quasar opens the development server and proxies `/api` requests to `http://127.0.0.1:8000` as configured in `frontend/quasar.config.ts`.

## 6. Running both workspaces

Terminal 1 — Backend:

```powershell
cd backend
php artisan serve
```

Terminal 2 — Frontend:

```powershell
cd frontend
npm run dev
```

Open the URL printed by Quasar. Use the **Test Backend** action on the home view to verify the client-to-server connection.

## 7. API contracts

### Implemented handshake

The Laravel backend implements:

```text
GET /api/hello
```

Response:

```json
{
  "message": "Hello from Mundia, Loberanes, Daro, and Villacorta! -MLDV"
}
```

The endpoint is implemented by `backend/routes/api.php` and `backend/app/Http/Controllers/Api/HelloController.php`.

### Expected dance contracts

The client service layer is prepared for the following endpoints, and the server fully implements the following standard CRUD endpoints:

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

The frontend normalizes snake_case API fields such as `cover_image` and `source_link` into its TypeScript model.

## 8. Data, storage, and assets

The frontend uses:

- `frontend/public/*.jpg` for seeded cover artwork.
- `frontend/public/default-cover-*.svg` for deterministic fallback artwork.
- Multipart `cover_image` payloads for server-backed uploads.
- `/storage/` paths and remote HTTP(S) URLs when supplied by an API response.

Database migrations and Eloquent models for Dance CRUD are fully implemented.

Never commit private `.env` files, `node_modules/`, Composer `vendor/`, build output, Laravel caches, or logs.

## 9. Development and verification

Before opening a pull request:

```powershell
cd frontend
npm run lint
npm run build
```

Run the backend test suite:

```powershell
cd backend
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
