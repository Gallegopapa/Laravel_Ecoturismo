<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuarios;
use App\Models\Place;
use App\Models\Favorite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FavoriteFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function createUser()
    {
        return Usuarios::create([
            'name' => 'Test User ' . Str::random(5),
            'email' => Str::random(5) . '@example.com',
            'password' => Hash::make('password'),
            'fecha_registro' => now(),
            'is_admin' => false,
        ]);
    }

    private function createPlace()
    {
        return Place::create([
            'name' => 'Lugar Test ' . Str::random(5),
            'description' => 'desc',
            'location' => 'ubicacion',
        ]);
    }

    public function test_user_can_view_favorites()
    {
        $user = $this->createUser();
        
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/favorites')
            ->assertStatus(200);
    }

    public function test_user_can_add_place_to_favorites()
    {
        $user = $this->createUser();
        $place = $this->createPlace();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/favorites', [
                'place_id' => $place->id,
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_user_cannot_add_same_place_twice()
    {
        $user = $this->createUser();
        $place = $this->createPlace();

        Favorite::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/favorites', [
                'place_id' => $place->id,
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('favorites', 1);
    }

    public function test_user_can_remove_place_from_favorites()
    {
        $user = $this->createUser();
        $place = $this->createPlace();

        Favorite::create([
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/favorites/' . $place->id)
            ->assertStatus(200);

        $this->assertDatabaseMissing('favorites', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_guest_cannot_access_favorites()
    {
        $place = $this->createPlace();

        $this->getJson('/api/favorites')->assertStatus(401);
        
        $this->postJson('/api/favorites', [
            'place_id' => $place->id,
        ])->assertStatus(401);
    }
}
