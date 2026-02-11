<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Rules\NoProfanity;
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
        $places = Place::with('categories')->orderBy('id', 'desc')->get();
        return response()->json($places);
    }

    /**
     * Obtener un lugar específico
     */
    public function show(Place $place): JsonResponse
    {
        $place->load(['categories', 'schedules']);
        return response()->json($place);
    }

    /**
     * Crear un nuevo lugar
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['nullable', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB máximo
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        // Manejar subida de imagen
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('places', $filename, 'public');
            // Guardar como ruta relativa para evitar dominio hardcodeado
            $data['image'] = '/storage/' . $path;
        }

        // Extraer categorías antes de crear el lugar
        $categories = $data['categories'] ?? [];
        unset($data['categories']);

        $place = Place::create($data);

        // Asociar categorías si se proporcionan
        if (!empty($categories)) {
            $place->categories()->sync($categories);
        }

        $place->load('categories');

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
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['nullable', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        // Manejar subida de nueva imagen
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe
            if ($place->image) {
                $oldFileName = basename(parse_url($place->image, PHP_URL_PATH));
                if ($oldFileName && Storage::disk('public')->exists('places/' . $oldFileName)) {
                    Storage::disk('public')->delete('places/' . $oldFileName);
                }
            }

            // Subir nueva imagen
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('places', $filename, 'public');
            $data['image'] = '/storage/' . $path;
        }

        // Extraer categorías antes de actualizar el lugar
        $categories = $data['categories'] ?? null;
        unset($data['categories']);

        $place->update($data);

        // Actualizar categorías si se proporcionan (incluso si es array vacío)
        if ($categories !== null) {
            // Si es array vacío, desasociar todas las categorías
            $place->categories()->sync($categories ?: []);
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
