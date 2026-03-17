<?php
// Script para reparar la relación entre lugares y categorías
// Asocia lugares a categorías según el campo categories en la tabla places (si existe)
// o deja preparado para asociar manualmente si no hay datos

use Illuminate\Support\Facades\DB;
use App\Models\Place;
use App\Models\Category;

require __DIR__.'/vendor/autoload.php';

// Cargar el framework
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Iniciar contexto de consola
$kernel->bootstrap();

// --- INICIO DEL SCRIPT ---
echo "\n--- Reparando relaciones lugares <-> categorías ---\n";

$allPlaces = Place::all();
$allCategories = Category::all();

echo "\n--- LISTA DE LUGARES ---\n";
foreach ($allPlaces as $p) {
    echo "ID: {$p->id} | Nombre: {$p->name}\n";
}

echo "\n--- LISTA DE CATEGORÍAS ---\n";
foreach ($allCategories as $c) {
    echo "ID: {$c->id} | Nombre: {$c->name}\n";
}
// Mapea manualmente los IDs de lugares a los IDs de categorías correspondientes
$lugaresCategorias = [
    // place_id => [category_id, ...]
    // Ejemplo:
    // 1 => [2, 3],
    // 2 => [1],
    // 3 => [2, 4],
    // ...
    // Agrega aquí todos los lugares y sus categorías
];

$reparadas = 0;
$sinCategorias = 0;
foreach ($lugaresCategorias as $placeId => $catIds) {
    $place = Place::find($placeId);
    if (!$place) {
        echo "Lugar con ID $placeId no encontrado.\n";
        continue;
    }
    if (count($catIds) > 0) {
        $place->categories()->sync($catIds);
        $reparadas++;
        echo "Lugar #{$place->id} ({$place->name}) asociado a categorías: [".implode(',', $catIds)."]\n";
    } else {
        $sinCategorias++;
        echo "Lugar #{$place->id} ({$place->name}) sin categorías detectadas.\n";
    }
}
echo "\nRelaciones reparadas: $reparadas\nLugares sin categorías: $sinCategorias\n";

echo "\n--- Fin del script ---\n";
