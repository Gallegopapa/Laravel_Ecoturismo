<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Place;
use App\Models\Category;

class PlaceController extends Controller
{
    /**
     * Obtener todos los lugares (público)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Place::query();
        
        // Filtrar por categoría si se proporciona
        if ($request->has('category_id')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }
        
        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }
        
        $places = $query->with(['categories', 'reviews.usuario:id,name,foto_perfil'])
            ->orderBy('name', 'asc')
            ->get();
        
        // Agregar información de rating a cada lugar
        $places->transform(function($place) {
            $place->average_rating = round($place->reviews->avg('rating') ?? 0, 1);
            $place->reviews_count = $place->reviews->count();
            return $place;
        });
        
        return response()->json($places);
    }

    /**
     * Crear un nuevo lugar
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        $place = Place::create($data);
        
        // Asociar categorías si se proporcionan
        if (isset($data['categories'])) {
            $place->categories()->sync($data['categories']);
        }
        
        $place->load('categories');
        
        return response()->json([
            'message' => 'Lugar creado correctamente.',
            'place' => $place
        ], 201);
    }

    /**
     * Obtener un lugar específico (público)
     */
    public function show(Place $place): JsonResponse
    {
        $place->load(['reservations', 'reviews.usuario:id,name,foto_perfil', 'categories']);
        
        // Calcular rating promedio
        $averageRating = $place->reviews->avg('rating') ?? 0;
        $reviewsCount = $place->reviews->count();
        
        return response()->json([
            'place' => $place,
            'average_rating' => round($averageRating, 1),
            'reviews_count' => $reviewsCount,
        ]);
    }

    /**
     * Actualizar un lugar
     */
    public function update(Request $request, Place $place): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        $place->update($data);
        
        // Actualizar categorías si se proporcionan
        if (isset($data['categories'])) {
            $place->categories()->sync($data['categories']);
        }
        
        $place->load('categories');
        
        return response()->json([
            'message' => 'Lugar actualizado correctamente.',
            'place' => $place
        ]);
    }

    /**
     * Eliminar un lugar
     */
    public function destroy(Place $place): JsonResponse
    {
        $place->delete();
        return response()->json(['message' => 'Lugar eliminado correctamente'], 200);
    }
}