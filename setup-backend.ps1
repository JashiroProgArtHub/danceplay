$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$patch = Join-Path $root 'server'
$tempPatch = Join-Path $root '_backend-patch'
$backend = Join-Path $root 'server'

Write-Host 'Preparing Laravel backend...'
Rename-Item -Path $patch -NewName '_backend-patch'
try {
    composer create-project laravel/laravel backend
    Copy-Item (Join-Path $tempPatch 'routes\api.php') (Join-Path $backend 'routes\api.php') -Force
    New-Item -ItemType Directory -Force (Join-Path $backend 'app\Http\Controllers\Api') | Out-Null
    Copy-Item (Join-Path $tempPatch 'app\Http\Controllers\Api\HelloController.php') (Join-Path $backend 'app\Http\Controllers\Api\HelloController.php') -Force
    Write-Host 'Laravel backend created and API route installed.'
    Write-Host 'Next: configure backend\.env, run php artisan install:api if your Laravel version requires it, then php artisan migrate and php artisan serve.'
}
finally {
    if (Test-Path $tempPatch) { Remove-Item $tempPatch -Recurse -Force }
}
