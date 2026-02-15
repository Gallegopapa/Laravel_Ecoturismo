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
     * Eliminar un ecohotel
     */
    public function destroy($id): \Illuminate\Http\JsonResponse
    {
        $ecohotel = Ecohotel::find($id);
        if (!$ecohotel) {
            return response()->json(['message' => 'Ecohotel no encontrado'], 404);
        }
        $ecohotel->delete();
        return response()->json(['message' => 'Ecohotel eliminado correctamente.']);
    }

    /**
     * Crear un nuevo ecohotel
     */
    public function store(Request $request): JsonResponse
    {
        \Log::info('REQUEST COMPLETO STORE', ['all' => $request->all()]);
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
        \Log::info('STORE - Campo places recibido', ['places' => $places]);
        unset($data['categories'], $data['places']);

        $ecohotel = Ecohotel::create($data);

        // Asociar categorías si se proporcionan
        if ($categories !== null) {
            $ecohotel->categories()->sync($categories);
        }
        // Asociar lugares si se proporcionan
        \Log::info('STORE - Antes de sync', ['places' => $places]);
        if ($places !== null) {
            $ecohotel->places()->sync($places);
        }
        \Log::info('STORE - Después de sync', ['ecohotel_places' => $ecohotel->places()->pluck('places.id')->toArray()]);

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
        \Log::info('REQUEST COMPLETO UPDATE', ['all' => $request->all()]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['required', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'nullable|exists:categories,id',
            'places' => 'nullable|array',
            'places.*' => 'nullable|exists:places,id',
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
        \Log::info('UPDATE - Campo places recibido', ['places' => $places]);
        unset($data['categories'], $data['places']);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', new NoProfanity()],
            'description' => ['nullable', 'string', new NoProfanity()],
            'location' => ['required', 'string', 'max:255', new NoProfanity()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'telefono' => ['nullable', 'string', 'max:20', new NoProfanity()],
            'email' => 'nullable|email|max:255',
            'sitio_web' => 'nullable|url|max:255',
            'categories' => 'array',
            'categories.*' => 'nullable|exists:categories,id',
            'places' => 'array',
            'places.*' => 'nullable|exists:places,id',
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
            $validated['image'] = '/storage/' . $path;
        }


        // Actualizar datos principales
        $ecohotel->update(collect($validated)->except(['categories', 'places'])->toArray());

        // Filtrar ids vacíos o nulos
        $categoriesSync = array_filter($validated['categories'] ?? [], fn($id) => $id !== null && $id !== '' && is_numeric($id));
        $placesSync = array_filter($validated['places'] ?? [], fn($id) => $id !== null && $id !== '' && is_numeric($id));

        // Sincronizar categorías (array vacío = sin categorías)
        $ecohotel->categories()->sync($categoriesSync);

        // Sincronizar lugares (array vacío = sin lugares)
        $ecohotel->places()->sync($placesSync);

        $ecohotel->load(['categories', 'places']);

        return response()->json([
            'message' => 'Ecohotel actualizado correctamente.',
            'ecohotel' => $ecohotel
        ]);
    }
}
