<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HelloController;

Route::get('/hello', [HelloController::class, 'index']);
