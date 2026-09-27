<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Dance;

class DanceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_all_dances(): void
    {
        Dance::factory()->create(['title' => 'Test Dance']);

        $response = $this->getJson('/api/dances');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Test Dance']);
    }

    public function test_can_create_dance(): void
    {
        $payload = [
            'title' => 'NewJeans Hype',
            'artist' => 'NewJeans',
            'category' => 'K-Pop',
            'difficulty' => 'Advanced',
            'status' => 'Learning',
            'progress' => 10,
            'favorite' => true,
        ];

        $response = $this->postJson('/api/dances', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['title' => 'NewJeans Hype']);
                 
        $this->assertDatabaseHas('dances', ['title' => 'NewJeans Hype']);
    }

    public function test_can_update_dance(): void
    {
        $dance = Dance::factory()->create(['title' => 'Old Title']);

        $response = $this->patchJson('/api/dances/' . $dance->id, [
            'title' => 'Updated Title'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('dances', ['title' => 'Updated Title']);
    }

    public function test_can_delete_dance(): void
    {
        $dance = Dance::factory()->create();

        $response = $this->deleteJson('/api/dances/' . $dance->id);

        $response->assertStatus(204);
        $this->assertDatabaseMissing('dances', ['id' => $dance->id]);
    }
}
