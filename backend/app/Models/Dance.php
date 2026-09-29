<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dance extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'artist',
        'category',
        'difficulty',
        'status',
        'progress',
        'favorite',
        'cover_image',
        'source_link',
        'upload_link',
        'notes',
    ];

    protected $casts = [
        'favorite' => 'boolean',
        'progress' => 'integer',
    ];
}
