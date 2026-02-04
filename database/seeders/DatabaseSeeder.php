<?php

namespace Database\Seeders;

use App\Models\Usuarios;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Crear usuario de prueba
        Usuarios::create([
            'name' => 'TestUser',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'remember_token' => Str::random(10),
            'fecha_registro' => now(),
            'is_admin' => true,
        ]);

        // Agregar horarios a lugares que no los tienen
        // Esto asegura que todos los lugares tengan horarios configurados
        $this->call(PlaceScheduleSeeder::class);
    }
}