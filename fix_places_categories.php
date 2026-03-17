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

$places = Place::all();
$categories = Category::all()->keyBy('id');

$reparadas = 0;
$sinCategorias = 0;
foreach ($places as $place) {
    // Si el lugar ya tiene categorías asociadas, saltar
    if ($place->categories()->count() > 0) {
        continue;
    }
    // Si el lugar tiene un campo categories (array o string de ids)
    $catIds = [];
    if (isset($place->categories) && is_array($place->categories) && count($place->categories) > 0) {
        $catIds = $place->categories;
    } elseif (isset($place->categories) && is_string($place->categories)) {
        // Si está como string separado por coma
        $catIds = array_filter(array_map('trim', explode(',', $place->categories)));
    }
    // Filtrar solo ids válidos
    $catIds = array_filter($catIds, function($id) use ($categories) {
        return $categories->has($id);
    });
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
