<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ecohotel;
use App\Rules\NoProfanity;
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
        $ecohotels = Ecohotel::with(['categories', 'places'])->orderBy('created_at', 'desc')->get();
        return response()->json($ecohotels);
    }

    /**
     * Crear un nuevo ecohotel
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['required', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'places' => 'nullable|array',
            'places.*' => 'exists:places,id',
        ], [
            'name.required' => 'El nombre del ecohotel es requerido.',
            'location.required' => 'La ubicación es requerida.',
            'latitude.required' => 'La latitud es requerida.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.required' => 'La longitud es requerida.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'email.email' => 'El email debe ser válido.',
            'sitio_web.url' => 'El sitio web debe ser una URL válida.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
            'places.array' => 'Los lugares deben ser un array.',
            'places.*.exists' => 'Uno o más lugares no existen.',
        ]);

        // Manejar subida de imagen
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('ecohotels', $filename, 'public');
            $data['image'] = '/storage/' . $path;
        }

        $categories = $data['categories'] ?? null;
        $places = $data['places'] ?? null;
        unset($data['categories'], $data['places']);

        $ecohotel = Ecohotel::create($data);

        // Asociar categorías si se proporcionan
        if ($categories !== null) {
            $ecohotel->categories()->sync($categories);
        }
        // Asociar lugares si se proporcionan
        if ($places !== null) {
            $ecohotel->places()->sync($places);
        }

        $ecohotel->load(['categories', 'places']);

        return response()->json([
            'message' => 'Ecohotel creado correctamente.',
            'ecohotel' => $ecohotel
        ], 201);
    }

    /**
     * Mostrar un ecohotel específico
     */
    public function show($id): JsonResponse
    {
        try {
            $ecohotel = Ecohotel::with(['categories', 'places'])->findOrFail($id);
            return response()->json($ecohotel);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Ecohotel no encontrado',
                'error' => true
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cargar el ecohotel: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    /**
     * Actualizar un ecohotel
     */
    public function update(Request $request, Ecohotel $ecohotel): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['required', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'places' => 'nullable|array',
            'places.*' => 'exists:places,id',
        ], [
            'name.required' => 'El nombre del ecohotel es requerido.',
            'location.required' => 'La ubicación es requerida.',
            'latitude.required' => 'La latitud es requerida.',
            'latitude.numeric' => 'La latitud debe ser un número.',
            'latitude.between' => 'La latitud debe estar entre -90 y 90.',
            'longitude.required' => 'La longitud es requerida.',
            'longitude.numeric' => 'La longitud debe ser un número.',
            'longitude.between' => 'La longitud debe estar entre -180 y 180.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'email.email' => 'El email debe ser válido.',
            'sitio_web.url' => 'El sitio web debe ser una URL válida.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
            'places.array' => 'Los lugares deben ser un array.',
            'places.*.exists' => 'Uno o más lugares no existen.',
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
        $places = $data['places'] ?? null;
        unset($data['categories'], $data['places']);

        $ecohotel->update($data);

        if ($categories !== null) {
            $ecohotel->categories()->sync($categories);
        }
        if ($places !== null) {
            $ecohotel->places()->sync($places);
        }

        $ecohotel->load(['categories', 'places']);

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
