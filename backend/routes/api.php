<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HelloController;
use App\Http\Controllers\DanceController;

Route::get('/hello', [HelloController::class, 'index']);
Route::apiResource('dances', DanceController::class);
