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
                 ->assertJsonStructure(['data', 'current_page', 'last_page'])
                 ->assertJsonFragment(['title' => 'Test Dance']);
    }

    public function test_can_fetch_trending_dances(): void
    {
        Dance::factory()->create(['title' => 'Trending Dance 1', 'favorite' => true, 'progress' => 90]);
        Dance::factory()->create(['title' => 'Trending Dance 2', 'favorite' => false, 'progress' => 40]);

        $response = $this->getJson('/api/dances/trending');

        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'Trending Dance 1', 'rank' => 1]);
    }

    public function test_can_fetch_dance_stats(): void
    {
        Dance::factory()->create(['status' => 'Learning', 'favorite' => true]);
        Dance::factory()->create(['status' => 'Ready to Film', 'favorite' => false]);
        Dance::factory()->create(['status' => 'Uploaded', 'favorite' => true]);

        $response = $this->getJson('/api/dances/stats');

        $response->assertStatus(200)
                 ->assertJson([
                     'total' => 3,
                     'learning' => 1,
                     'ready' => 1,
                     'uploaded' => 1,
                     'favorites' => 2,
                 ]);
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
        $this->assertSoftDeleted('dances', ['id' => $dance->id]);
    }

    public function test_can_restore_dance(): void
    {
        $dance = Dance::factory()->create(['title' => 'To Restore']);
        $dance->delete();

        $this->assertSoftDeleted('dances', ['id' => $dance->id]);

        $response = $this->postJson('/api/dances/' . $dance->id . '/restore');
        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'To Restore']);

        $this->assertNotSoftDeleted('dances', ['id' => $dance->id]);
    }

    public function test_create_dance_fails_validation_when_required_fields_missing(): void
    {
        $response = $this->postJson('/api/dances', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title', 'artist', 'category', 'difficulty']);
    }

    public function test_create_dance_normalizes_camel_case_keys(): void
    {
        $payload = [
            'title' => 'Magnetic',
            'artist' => 'ILLIT',
            'category' => 'K-Pop',
            'difficulty' => 'Medium',
            'sourceLink' => 'https://www.youtube.com/watch?v=demo',
            'uploadLink' => 'https://www.tiktok.com/@user/video/123',
            'coverImage' => 'https://example.com/cover.jpg',
        ];

        $response = $this->postJson('/api/dances', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('dances', [
            'title' => 'Magnetic',
            'source_link' => 'https://www.youtube.com/watch?v=demo',
            'upload_link' => 'https://www.tiktok.com/@user/video/123',
            'cover_image' => 'https://example.com/cover.jpg',
        ]);
    }
}
