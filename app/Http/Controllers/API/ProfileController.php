<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Obtener información del perfil del usuario autenticado
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'foto_perfil' => $user->foto_perfil,
                'fecha_registro' => $user->fecha_registro,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    /**
     * Actualizar información del perfil
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        // Log detallado para debugging
        Log::info('Profile update request', [
            'method' => $request->method(),
            'has_file' => $request->hasFile('foto_perfil'),
        ]);

        if ($request->hasFile('foto_perfil')) {
            $file = $request->file('foto_perfil');
            Log::info('Foto recibida', [
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:3', 'unique:usuarios,name,' . $user->id, 'regex:/^[a-zA-Z0-9_]+$/'],
            'email' => ['nullable', 'email', 'max:255', 'unique:usuarios,email,' . $user->id],
            'telefono' => ['nullable', 'string', 'max:20'],
            'foto_perfil' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'], // 5MB máximo
        ], [
            'name.required' => 'El nombre de usuario es requerido.',
            'name.min' => 'El nombre de usuario debe tener al menos 3 caracteres.',
            'name.unique' => 'Este nombre de usuario ya está en uso.',
            'name.regex' => 'El nombre de usuario solo puede contener letras, números y guiones bajos.',
            'email.email' => 'El correo electrónico debe ser válido.',
            'email.unique' => 'Este correo electrónico ya está en uso.',
            'telefono.max' => 'El teléfono no puede exceder 20 caracteres.',
            'foto_perfil.image' => 'El archivo debe ser una imagen.',
            'foto_perfil.max' => 'La imagen no puede exceder 5MB.',
        ]);

        // Manejar subida de foto de perfil
        if ($request->hasFile('foto_perfil')) {
            try {
                // Eliminar foto anterior si existe
                if ($user->foto_perfil) {
                    // Extraer el nombre del archivo de la URL
                    $oldImageUrl = $user->foto_perfil;
                    // Si es una URL completa, extraer solo el nombre del archivo
                    if (strpos($oldImageUrl, 'storage/profiles/') !== false || strpos($oldImageUrl, '/storage/profiles/') !== false) {
                        $oldFileName = basename(parse_url($oldImageUrl, PHP_URL_PATH));
                        if ($oldFileName && Storage::disk('public')->exists('profiles/' . $oldFileName)) {
                            Storage::disk('public')->delete('profiles/' . $oldFileName);
                            Log::info('Foto antigua eliminada', ['filename' => $oldFileName]);
                        }
                    }
                }

                // Subir nueva foto
                $image = $request->file('foto_perfil');
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                
                Log::info('Intentando guardar foto', [
                    'filename' => $filename,
                    'destination' => 'profiles/' . $filename,
                ]);
                
                $path = $image->storeAs('profiles', $filename, 'public');
                
                Log::info('Foto guardada exitosamente', [
                    'path' => $path,
                    'full_url' => '/storage/' . $path,
                ]);
                
                $validated['foto_perfil'] = '/storage/' . $path;
            } catch (\Exception $e) {
                Log::error('Error al guardar foto', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json([
                    'message' => 'Error al guardar la imagen: ' . $e->getMessage()
                ], 500);
            }
        } else {
            // Si no se envía nueva foto, mantener la existente
            unset($validated['foto_perfil']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'foto_perfil' => $user->foto_perfil,
                'fecha_registro' => $user->fecha_registro,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    /**
     * Cambiar contraseña del usuario
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'max:20', 'confirmed'],
        ], [
            'current_password.required' => 'La contraseña actual es requerida.',
            'new_password.required' => 'La nueva contraseña es requerida.',
            'new_password.min' => 'La nueva contraseña debe tener al menos 6 caracteres.',
            'new_password.max' => 'La nueva contraseña no puede tener más de 20 caracteres.',
            'new_password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        // Verificar que la contraseña actual sea correcta
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta.'
            ], 422);
        }

        // Verificar que la nueva contraseña sea diferente
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'La nueva contraseña debe ser diferente a la actual.'
            ], 422);
        }

        // Actualizar la contraseña
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.'
        ]);
    }
}

