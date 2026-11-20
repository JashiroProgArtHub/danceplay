<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dance;

class DanceSeeder extends Seeder
{
    public function run(): void
    {
        $dances = [
            ['title' => 'Magnetic', 'artist' => 'ILLIT', 'category' => 'K-Pop', 'difficulty' => 'Beginner', 'status' => 'Learning', 'progress' => 30, 'favorite' => true, 'cover_image' => '/illit.jpg'],
            ['title' => 'Espresso', 'artist' => 'Sabrina Carpenter', 'category' => 'Pop', 'difficulty' => 'Intermediate', 'status' => 'Not Started', 'progress' => 0, 'favorite' => false, 'cover_image' => '/sabrinacarpenter.jpg'],
            ['title' => 'Supernova', 'artist' => 'aespa', 'category' => 'K-Pop', 'difficulty' => 'Advanced', 'status' => 'Learning', 'progress' => 65, 'favorite' => true, 'cover_image' => '/aespa.jpg'],
            ['title' => 'Drama', 'artist' => 'aespa', 'category' => 'K-Pop', 'difficulty' => 'Advanced', 'status' => 'Mastered', 'progress' => 100, 'favorite' => true, 'cover_image' => '/aespadrama.jpg'],
            ['title' => 'Smart', 'artist' => 'LE SSERAFIM', 'category' => 'K-Pop', 'difficulty' => 'Intermediate', 'status' => 'Learning', 'progress' => 85, 'favorite' => false, 'cover_image' => '/lesserafim.jpg'],
            ['title' => 'You & Me', 'artist' => 'Jennie', 'category' => 'K-Pop', 'difficulty' => 'Beginner', 'status' => 'Mastered', 'progress' => 100, 'favorite' => true, 'cover_image' => '/likejennie.jpg'],
            ['title' => 'Touch', 'artist' => 'KATSEYE', 'category' => 'Pop', 'difficulty' => 'Beginner', 'status' => 'Learning', 'progress' => 45, 'favorite' => false, 'cover_image' => '/katseye.jpg'],
            ['title' => 'How Sweet', 'artist' => 'NewJeans', 'category' => 'K-Pop', 'difficulty' => 'Intermediate', 'status' => 'Not Started', 'progress' => 0, 'favorite' => false, 'cover_image' => '/newjeans.jpg'],
        ];

        foreach ($dances as $dance) {
            Dance::updateOrCreate(
                ['title' => $dance['title'], 'artist' => $dance['artist']],
                $dance
            );
        }
    }
}
