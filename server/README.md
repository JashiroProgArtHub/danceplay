# Laravel backend patch for DancePlay Activity 2

This `backend/` directory contains the files you need to apply to a standard Laravel installation.

Because a full Laravel installation contains Composer-managed framework files and `vendor/`, this submission package intentionally keeps the backend patch small.

## 1. Create the Laravel project

From the `DancePlay-Activity2` parent directory, use a temporary name if `backend/` already contains these patch files:

```powershell
composer create-project laravel/laravel backend-laravel
```

Then copy:

```text
backend/routes/api.php
```

and

```text
backend/app/Http/Controllers/Api/HelloController.php
```

into the matching locations inside `backend-laravel/`.

You can then rename the generated Laravel folder to `backend` after moving/removing this patch folder.

## 2. API

The prepared endpoint is:

```text
GET /api/hello
```

Response:

```json
{
  "message": "Hello from Jashen Loberanes!"
}
```

## 3. Run

```powershell
cd backend
php artisan migrate
php artisan serve
```
