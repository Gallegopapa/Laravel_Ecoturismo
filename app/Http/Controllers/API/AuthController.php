<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request): JsonResponse
    {
        $payload = [
            'name' => trim((string) $request->input('name', '')),
            'email' => strtolower(trim((string) $request->input('email', ''))),
            'password' => (string) $request->input('password', ''),
            'password_confirmation' => (string) $request->input('password_confirmation', ''),
        ];

        $validator = Validator::make($payload, [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-Z0-9_]+$/',
                Rule::unique('usuarios', 'name'),
            ],
            'email' => ['required', 'string', 'email', 'max:255', 'regex:/^[A-Z0-9._%+-]+@gmail\.com$/i', Rule::unique('usuarios', 'email')],
            'password' => 'required|string|min:8|max:72|confirmed',
        ], [
            'name.required' => 'El nombre de usuario es requerido.',
            'name.min' => 'El nombre de usuario debe tener al menos 3 caracteres.',
            'name.max' => 'El nombre de usuario no puede exceder 255 caracteres.',
            'name.unique' => 'Este nombre de usuario ya está en uso.',
            'name.regex' => 'El nombre de usuario solo puede contener letras, números y guiones bajos.',
            'email.required' => 'El email es requerido.',
            'email.email' => 'El email debe ser una dirección válida.',
            'email.regex' => 'Solo se permiten correos con dominio @gmail.com.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es requerida.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede tener más de 72 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $validator->after(function ($validator) use ($payload) {
            if (Usuarios::query()->whereRaw('LOWER(name) = ?', [strtolower($payload['name'])])->exists()) {
                $validator->errors()->add('name', 'Este nombre de usuario ya está en uso.');
            }

            if (Usuarios::query()->whereRaw('LOWER(email) = ?', [$payload['email']])->exists()) {
                $validator->errors()->add('email', 'Este email ya está registrado.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $user = Usuarios::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'fecha_registro' => now(),
        ]);

        // Crear token de autenticación
        $token = $user->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;

            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'telefono' => $user->telefono,
                    'foto_perfil' => $user->foto_perfil,
                    'fecha_registro' => $user->fecha_registro,
                    'is_admin' => $user->is_admin,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 30 * 24 * 60 * 60, // 30 días en segundos
            ], 201);
    }

    /**
     * Iniciar sesión - Login por correo electrónico y contraseña
     */
    public function login(Request $request): JsonResponse
    {
        $forgotPasswordUrl = rtrim(env('FRONTEND_URL', config('app.url')), '/') . '/forgot-password';

        $loginValue = trim((string) $request->input('login', $request->input('email', '')));
        $password = (string) $request->input('password', '');

        try {
            $validator = Validator::make([
                'login' => $loginValue,
                'password' => $password,
            ], [
                'login' => 'required|string|max:255',
                'password' => 'required|string|min:1',
            ], [
                'login.required' => 'El correo o usuario es requerido.',
                'password.required' => 'La contraseña es requerida.',
            ]);

            if (str_contains($loginValue, '@') && !preg_match('/^[A-Z0-9._%+-]+@gmail\.com$/i', $loginValue)) {
                throw ValidationException::withMessages([
                    'login' => ['Solo se permiten correos con dominio @gmail.com.'],
                ]);
            }

            if ($validator->fails()) {
                throw ValidationException::withMessages($validator->errors()->toArray());
            }
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
                'forgot_password_url' => $forgotPasswordUrl,
            ], 422);
        }

        try {
            $normalizedLogin = strtolower($loginValue);

            // Buscar usuario por correo o nombre de usuario
            $user = Usuarios::query()
                ->whereRaw('LOWER(email) = ?', [$normalizedLogin])
                ->orWhereRaw('LOWER(name) = ?', [$normalizedLogin])
                ->first();

            // Validar que el usuario exista
            if (!$user) {
                Log::warning('Intento de login fallido - Usuario no encontrado', [
                    'login' => $loginValue,
                ]);
                return response()->json([
                    'message' => 'Las credenciales proporcionadas son incorrectas.',
                    'errors' => [
                        'credentials' => ['No se encontró un usuario con esas credenciales.']
                    ],
                    'forgot_password_url' => $forgotPasswordUrl,
                ], 422);
            }

            // Validar contraseña
            if (!Hash::check($password, $user->password)) {
                Log::warning('Intento de login fallido - Contraseña incorrecta', [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                ]);
                return response()->json([
                    'message' => 'Las credenciales proporcionadas son incorrectas.',
                    'errors' => [
                        'credentials' => ['La contraseña es incorrecta.']
                    ],
                    'forgot_password_url' => $forgotPasswordUrl,
                ], 422);
            }

            // Crear token de autenticación
            // Revocar tokens anteriores del mismo dispositivo si existe
            $user->tokens()->where('name', 'api-token')->delete();
            
            // Crear nuevo token
            $token = $user->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;

            Log::info('Login exitoso', [
                'user_id' => $user->id,
                'user_name' => $user->name,
            ]);

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'telefono' => $user->telefono,
                    'foto_perfil' => $user->foto_perfil,
                    'fecha_registro' => $user->fecha_registro,
                    'is_admin' => $user->is_admin,
                    'tipo_usuario' => $user->tipo_usuario,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 30 * 24 * 60 * 60, // 30 días en segundos
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al procesar login: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error al procesar el inicio de sesión. Por favor, intenta de nuevo.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Cerrar sesión - Revoca el token actual
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Revocar el token actual
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ], 200);
    }

    /**
     * Cerrar todas las sesiones - Revoca todos los tokens del usuario
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Revocar todos los tokens del usuario
        $user->tokens()->delete();
        
        return response()->json([
            'message' => 'Todas las sesiones han sido cerradas exitosamente'
        ], 200);
    }

    /**
     * Obtener información del usuario autenticado
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('reservations');
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'foto_perfil' => $user->foto_perfil,
                'fecha_registro' => $user->fecha_registro,
                'is_admin' => $user->is_admin,
                'tipo_usuario' => $user->tipo_usuario,
                'reservations_count' => $user->reservations->count(),
            ],
            'reservations' => $user->reservations,
        ], 200);
    }

    /**
     * Verificar si el token es válido
     */
    public function verifyToken(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user) {
            return response()->json([
                'valid' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'telefono' => $user->telefono,
                    'foto_perfil' => $user->foto_perfil,
                    'is_admin' => $user->is_admin,
                    'tipo_usuario' => $user->tipo_usuario,
                ],
                'message' => 'Token válido'
            ], 200);
        }
        
        return response()->json([
            'valid' => false,
            'message' => 'Token inválido o expirado'
        ], 401);
    }
}