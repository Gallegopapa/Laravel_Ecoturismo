<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ecohotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EcohotelController extends Controller
{
    /**
     * Listar todos los ecohoteles (para admin)
     */
    public function index(): JsonResponse
    {
        $ecohotels = Ecohotel::with('categories')->orderBy('created_at', 'desc')->get();
        
        return response()->json($ecohotels);
    }

    /**
     * Crear un nuevo ecohotel
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del ecohotel es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'email.email' => 'El email debe ser válido.',
            'sitio_web.url' => 'El sitio web debe ser una URL válida.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        // Manejar subida de imagen
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('ecohotels', $filename, 'public');
            $data['image'] = '/storage/' . $path;
        }

        $categories = $data['categories'] ?? null;
        unset($data['categories']);

        $ecohotel = Ecohotel::create($data);
        
        // Asociar categorías si se proporcionan
        if ($categories !== null) {
            $ecohotel->categories()->sync($categories);
        }
        
        $ecohotel->load('categories');
        
        return response()->json([
            'message' => 'Ecohotel creado correctamente.',
            'ecohotel' => $ecohotel
        ], 201);
    }

    /**
     * Mostrar un ecohotel específico
     */
    public function show(Ecohotel $ecohotel): JsonResponse
    {
        $ecohotel->load('categories', 'reviews.usuario');
        
        return response()->json($ecohotel);
    }

    /**
     * Actualizar un ecohotel
     */
    public function update(Request $request, Ecohotel $ecohotel): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del ecohotel es requerido.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'email.email' => 'El email debe ser válido.',
            'sitio_web.url' => 'El sitio web debe ser una URL válida.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        // Manejar actualización de imagen
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior
            if ($ecohotel->image) {
                $oldFileName = basename(parse_url($ecohotel->image, PHP_URL_PATH));
                if ($oldFileName && Storage::disk('public')->exists('ecohotels/' . $oldFileName)) {
                    Storage::disk('public')->delete('ecohotels/' . $oldFileName);
                }
            }

            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('ecohotels', $filename, 'public');
            $data['image'] = '/storage/' . $path;
        }

        $categories = $data['categories'] ?? null;
        unset($data['categories']);

        $ecohotel->update($data);

        if ($categories !== null) {
            $ecohotel->categories()->sync($categories);
        }

        $ecohotel->load('categories');

        return response()->json([
            'message' => 'Ecohotel actualizado correctamente.',
            'ecohotel' => $ecohotel
        ]);
    }

    /**
     * Eliminar un ecohotel
     */
    public function destroy(Ecohotel $ecohotel): JsonResponse
    {
        // Eliminar imagen si existe
        if ($ecohotel->image && strpos($ecohotel->image, 'storage/ecohotels/') !== false) {
            $imagePath = str_replace(asset(''), '', $ecohotel->image);
            $imagePath = str_replace('storage/', '', $imagePath);
            if (Storage::disk('public')->exists('ecohotels/' . basename($imagePath))) {
                Storage::disk('public')->delete('ecohotels/' . basename($imagePath));
            }
        }

        $ecohotel->delete();

        return response()->json([
            'message' => 'Ecohotel eliminado correctamente.'
        ]);
    }
}
