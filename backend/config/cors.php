<?php

$allowedOrigin = env('CORS_ALLOWED_ORIGIN');

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigin ? [$allowedOrigin] : [],
    'allowed_origins_patterns' => ['/^https:\/\/.*\.vercel\.app$/'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
