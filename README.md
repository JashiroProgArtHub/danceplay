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

Make sure the following tools are installed on your machine before running the project:

- **Git**
- **Node.js** (v18 or v20 LTS recommended) and **npm** (`node -v`, `npm -v`)
- **XAMPP** (with Apache and MySQL)
- **PHP 8.2 or newer** (`php -v`)
  > **Tip**: If `php` is not recognized in your terminal, add your PHP folder (e.g. `C:\xampp\php`) to your Windows System Environment Variables `PATH`. Also ensure extensions `pdo_mysql`, `fileinfo`, and `curl` are enabled in `php.ini`.
- **Composer** (`composer -v`)
- **PowerShell** (for Windows terminal commands)

---

## 4. Local Environment Setup (Step-by-Step)

Follow these steps in order when setting up the repository for the first time:

### Step 1: Start XAMPP & Create the Database
1. Open the **XAMPP Control Panel**.
2. Click **Start** for both **Apache** and **MySQL**.
   - Ensure MySQL shows port `3306` (or note down your custom port).
3. Open your browser and navigate to phpMyAdmin:
   ```text
   http://localhost/phpmyadmin
   ```
4. Click the **Databases** tab at the top.
5. In **Database name**, enter: `danceplay`
6. Click **Create**.

---

### Step 2: Backend Setup (Laravel)
Open PowerShell and navigate to the backend directory:

```powershell
cd backend
copy .env.example .env
```

Verify your `backend/.env` file contains the following database configuration:
```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=danceplay
DB_USERNAME=root
DB_PASSWORD=
```
*(If your XAMPP MySQL uses a custom port like `3307` or a custom root password, adjust `DB_PORT` and `DB_PASSWORD` accordingly).*

Now, install dependencies, prepare keys, migrate, and seed the starter data:

```powershell
# 1. Install PHP dependencies
composer install

# 2. Generate application encryption key
php artisan key:generate

# 3. Create tables and populate starter dance data
php artisan migrate:fresh --seed

# 4. Link public storage (required for dance cover image uploads)
php artisan storage:link

# 5. Start the Laravel API server
php artisan serve
```
The backend API is now running at `http://127.0.0.1:8000`. Keep this terminal open!

> **Automated Shortcut**: Alternatively, you can run `.\setup-backend.ps1` from the repository root after starting XAMPP and creating `danceplay` in phpMyAdmin.

---

### Step 3: Frontend Setup (Vue / Quasar)
Open a **second terminal window**:

```powershell
cd frontend
npm install
npm run dev
```

Quasar will launch and provide a local URL (typically `http://localhost:9000`).

---

## 5. Verification & Testing Connection
1. Open `http://localhost:9000` in your browser.
2. The dashboard should load and display the seeded starter dances (*Magnetic, Espresso, Supernova, Drama, etc.*).
3. To test client-to-server connectivity:
   * Open the user menu (or look for the API test card).
   * Click **Test Backend / Laravel API Test**.
   * It should return a success message from `/api/hello`.
4. Open phpMyAdmin (`http://localhost/phpmyadmin` -> `danceplay` -> `dances` table) to verify your records are in MySQL.

---

## 6. Common Pitfalls & Troubleshooting

| Issue / Error | Cause | Solution |
| :--- | :--- | :--- |
| **`SQLSTATE[HY000] [1049] Unknown database 'danceplay'`** | The database has not been created in phpMyAdmin yet. | Open `http://localhost/phpmyadmin`, click **Databases**, create `danceplay`, then re-run `php artisan migrate:fresh --seed`. |
| **`SQLSTATE[HY000] [2002] Connection refused`** | MySQL is not running in XAMPP or is on a different port. | Open XAMPP Control Panel, start **MySQL**. Check what port it displays (e.g. `3306` or `3307`) and match `DB_PORT` in `backend/.env`. |
| **`Column not found: Unknown column 'dances.deleted_at'`** (500 Error) | Migration history is out of sync or old table schema exists. | Run `php artisan migrate:fresh --seed` in `backend/` to cleanly re-apply all migrations including soft-deletes. |
| **Blank Dashboard / 0 dances shown** | Migrations were run without the seeder flag. | Run `php artisan migrate:fresh --seed` to populate starter dances. |
| **Broken / Missing Uploaded Cover Images (404)** | Laravel storage link was not created. | Run `php artisan storage:link` inside `backend/`. |
| **`'php'` or `'composer'` is not recognized** | PHP / Composer is not in your system environment PATH. | Add your PHP directory (e.g. `C:\xampp\php`) to your Windows User/System `PATH` variable and restart PowerShell. |


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
