<?php

namespace Database\Factories;

use App\Models\Dance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dance>
 */
class DanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->words(2, true),
            'artist' => fake()->name(),
            'category' => 'K-Pop',
            'difficulty' => 'Beginner',
            'status' => 'Learning',
            'progress' => 0,
            'favorite' => false,
        ];
    }
}
