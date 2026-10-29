$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$backend = Join-Path $root 'backend'

Write-Host "Setting up DancePlay Backend..." -ForegroundColor Cyan

# 1. Check for PHP & Composer
if (!(Get-Command php -ErrorAction SilentlyContinue)) { throw "PHP is not installed or not in PATH." }
if (!(Get-Command composer -ErrorAction SilentlyContinue)) { throw "Composer is not installed or not in PATH." }

Set-Location $backend

# 2. Install Dependencies
Write-Host "Installing Composer dependencies..."
composer install

# 3. Environment Setup
if (-not (Test-Path '.env')) {
    Write-Host "Creating .env file..."
    Copy-Item '.env.example' '.env'
    
    Write-Host "Generating application key..."
    php artisan key:generate
}

# 4. Database Setup
Write-Host "Migrating and seeding database (Ensure MySQL is running & 'danceplay' database is created in phpMyAdmin)..." -ForegroundColor Yellow
php artisan migrate:fresh --seed

# 5. Storage Link
Write-Host "Linking storage..."
php artisan storage:link

Write-Host "Backend setup complete. Run 'php artisan serve' in the backend directory." -ForegroundColor Green