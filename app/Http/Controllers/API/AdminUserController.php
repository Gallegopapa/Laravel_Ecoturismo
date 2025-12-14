<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * Obtener todos los usuarios
     */
    public function index(): JsonResponse
    {
        $users = Usuarios::orderBy('id', 'desc')->get();
        
        return response()->json($users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'is_admin' => $user->is_admin,
                'fecha_registro' => $user->fecha_registro,
            ];
        }));
    }

    /**
     * Obtener un usuario específico
     */
    public function show(Usuarios $user): JsonResponse
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'is_admin' => $user->is_admin,
            'fecha_registro' => $user->fecha_registro,
        ]);
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|min:3|unique:usuarios,name|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'nullable|email|max:255|unique:usuarios,email',
            'password' => 'nullable|string|min:6',
            'is_admin' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre de usuario es requerido.',
            'name.unique' => 'Este nombre de usuario ya está en uso.',
            'name.regex' => 'El nombre de usuario solo puede contener letras, números y guiones bajos.',
            'email.email' => 'El email debe ser válido.',
            'email.unique' => 'Este email ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        $userData = [
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'password' => Hash::make($data['password'] ?? 'password123'), // Contraseña por defecto
            'is_admin' => $data['is_admin'] ?? false,
            'fecha_registro' => now(),
        ];

        $user = Usuarios::create($userData);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ], 201);
    }

    /**
     * Actualizar un usuario
     */
    public function update(Request $request, Usuarios $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255|min:3|unique:usuarios,name,' . $user->id . '|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'nullable|email|max:255|unique:usuarios,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'is_admin' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre de usuario es requerido.',
            'name.unique' => 'Este nombre de usuario ya está en uso.',
            'name.regex' => 'El nombre de usuario solo puede contener letras, números y guiones bajos.',
            'email.email' => 'El email debe ser válido.',
            'email.unique' => 'Este email ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        $updateData = [];
        
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        
        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }
        
        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }
        
        if (isset($data['is_admin'])) {
            $updateData['is_admin'] = $data['is_admin'];
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    /**
     * Eliminar un usuario
     */
    public function destroy(Request $request, Usuarios $user): JsonResponse
    {
        // No permitir eliminar al usuario actual
        $currentUser = $request->user();
        if ($currentUser && $user->id === $currentUser->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu propio usuario.'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente.'
        ]);
    }
}
