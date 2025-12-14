<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminPlaceController extends Controller
{
    /**
     * Obtener todos los lugares (para admin)
     */
    public function index(): JsonResponse
    {
        $places = Place::orderBy('id', 'desc')->get();
        return response()->json($places);
    }

    /**
     * Obtener un lugar específico
     */
    public function show(Place $place): JsonResponse
    {
        return response()->json($place);
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB máximo
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
        ]);

        // Manejar subida de imagen
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('places', $filename, 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $place = Place::create($data);

        return response()->json([
            'message' => 'Lugar creado correctamente.',
            'place' => $place
        ], 201);
    }

    /**
     * Actualizar un lugar
     */
    public function update(Request $request, Place $place): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
        ]);

        // Manejar subida de nueva imagen
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe
            if ($place->image && strpos($place->image, 'storage/places/') !== false) {
                $oldImagePath = str_replace(asset(''), '', $place->image);
                $oldImagePath = str_replace('storage/', '', $oldImagePath);
                if (Storage::disk('public')->exists('places/' . basename($oldImagePath))) {
                    Storage::disk('public')->delete('places/' . basename($oldImagePath));
                }
            }

            // Subir nueva imagen
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('places', $filename, 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $place->update($data);

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
        // Eliminar imagen si existe
        if ($place->image && strpos($place->image, 'storage/places/') !== false) {
            $imagePath = str_replace(asset(''), '', $place->image);
            $imagePath = str_replace('storage/', '', $imagePath);
            if (Storage::disk('public')->exists('places/' . basename($imagePath))) {
                Storage::disk('public')->delete('places/' . basename($imagePath));
            }
        }

        $place->delete();

        return response()->json([
            'message' => 'Lugar eliminado correctamente.'
        ]);
    }
}
