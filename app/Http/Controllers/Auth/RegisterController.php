<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function create()
    {
        return view('registro');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:usuarios,name',
            'email' => 'required|email|max:255|unique:usuarios,email',
            'password' => 'required|string|min:6|max:20|confirmed',
        ], [
            // Mensajes para el campo name
            'name.required' => 'El nombre de usuario es obligatorio.',
            'name.string' => 'El nombre de usuario debe ser texto.',
            'name.max' => 'El nombre de usuario no puede tener más de 255 caracteres.',
            'name.unique' => 'Este nombre de usuario ya está en uso. Por favor elige otro.',
            
            // Mensajes para el campo email
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debes proporcionar un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'email.unique' => 'Este correo electrónico ya está registrado. Intenta iniciar sesión.',
            
            // Mensajes para el campo password
            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser texto.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.max' => 'La contraseña no puede tener más de 20 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden. Por favor verifica.',
        ]);

        $user = Usuarios::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'fecha_registro' => now(),
        ]);

        return redirect()->route('login')->with('status', 'Registro exitoso. Puedes iniciar sesión.');
    }
}
