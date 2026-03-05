<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RegisterController extends Controller
{
    public function create()
    {
        return view('registro');
    }

    public function store(Request $request)
    {
        $payload = [
            'name' => trim((string) $request->input('name', '')),
            'email' => strtolower(trim((string) $request->input('email', ''))),
            'password' => (string) $request->input('password', ''),
            'password_confirmation' => (string) $request->input('password_confirmation', ''),
        ];

        $validator = Validator::make($payload, [
            'name' => ['required', 'string', 'max:255', Rule::unique('usuarios', 'name')],
            'email' => ['required', 'string', 'email', 'max:255', 'regex:/^[A-Z0-9._%+-]+@gmail\\.com$/i', Rule::unique('usuarios', 'email')],
            'password' => 'required|string|min:8|max:72|confirmed',
        ], [
            // Mensajes para el campo name
            'name.required' => 'El nombre de usuario es obligatorio.',
            'name.string' => 'El nombre de usuario debe ser texto.',
            'name.max' => 'El nombre de usuario no puede tener más de 255 caracteres.',
            'name.unique' => 'Este nombre de usuario ya está en uso. Por favor elige otro.',
            
            // Mensajes para el campo email
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debes proporcionar un correo electrónico válido.',
            'email.regex' => 'Solo se permiten correos con dominio @gmail.com.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'email.unique' => 'Este correo electrónico ya está registrado. Intenta iniciar sesión.',
            
            // Mensajes para el campo password
            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede tener más de 72 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden. Por favor verifica.',
        ]);

        $validator->after(function ($validator) use ($payload) {
            if (Usuarios::query()->whereRaw('LOWER(name) = ?', [strtolower($payload['name'])])->exists()) {
                $validator->errors()->add('name', 'Este nombre de usuario ya está en uso. Por favor elige otro.');
            }

            if (Usuarios::query()->whereRaw('LOWER(email) = ?', [$payload['email']])->exists()) {
                $validator->errors()->add('email', 'Este correo electrónico ya está registrado. Intenta iniciar sesión.');
            }
        });

        $data = $validator->validate();

        $user = Usuarios::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'fecha_registro' => now(),
        ]);

        return redirect()->route('login')->with('status', 'Registro exitoso. Puedes iniciar sesión.');
    }
}
