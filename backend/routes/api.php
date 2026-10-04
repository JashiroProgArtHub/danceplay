<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HelloController;
use App\Http\Controllers\DanceController;

Route::get('/hello', [HelloController::class, 'index']);
Route::get('/dances/trending', [DanceController::class, 'trending']);
Route::get('/dances/stats', [DanceController::class, 'stats']);
Route::post('/dances/{id}/restore', [DanceController::class, 'restore']);
Route::apiResource('dances', DanceController::class);
