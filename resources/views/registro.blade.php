<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ asset('css/registro.css') }}">
    <link rel="icon" href="{{ asset('imagenes/iconoecoturismo.jpg') }}">
    <title>Registro</title>
    <style>.error{color:#c0392b;margin-top:6px}.status{color:green;margin-top:6px}</style>
</head>
<body>
    <header>
        <h2>Risaralda EcoTurismo</h2>
    </header>
    <div class="contenedor">
        <div class="login">
            <form id="formulario" action="{{ route('registro.store') }}" method="POST">
                @csrf
                <h3>Regístrate...</h3>
                <label for="name">Nombre de usuario:</label>
                <input type="text" id="name" name="name" value="{{ old('name') }}" required>
                @error('name')<div class="error">{{ $message }}</div>@enderror

                <label for="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" required>
                @error('email')<div class="error">{{ $message }}</div>@enderror

                <label for="password">Contraseña (6-20 caracteres):</label>
                <input type="password" id="password" name="password" required minlength="6" maxlength="20">
                @error('password')<div class="error">{{ $message }}</div>@enderror

                <label for="password_confirmation">Repita Contraseña:</label>
                <input type="password" id="password_confirmation" name="password_confirmation" required minlength="6" maxlength="20">

                @if(session('status'))
                    <div class="status">{{ session('status') }}</div>
                @endif

                <p><strong>¿Ya tienes una cuenta?</strong><br><a href="{{ route('login') }}">Inicia Sesión</a></p>
                <button id="btn" type="submit">Ingresar</button>
            </form>
        </div>
        <footer>
            <p>© 2025 Risaralda EcoTurismo</p>
        </footer>
    </div>
    {{-- <script type="text/javascript" src="{{ asset('js/registro.js') }}"></script> --}}
</body>
</html>