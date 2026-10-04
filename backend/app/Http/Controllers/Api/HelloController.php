<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HelloController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Hello from Mundia, Loberanes, Daro, and Villacorta! -MLDV',
        ]);
    }
}
