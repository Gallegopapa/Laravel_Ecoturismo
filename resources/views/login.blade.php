<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="icon" href="{{ asset('imagenes/iconoecoturismo.jpg') }}">
    <title>Login</title>
</head>
<body>
    <video autoplay loop muted id="video_background" preload="auto" volume="50">
        <source src="{{ asset('imagenes/Videofondo2.mp4') }}" type="video/mp4" />
    </video>
    <header>
        <h1>Risaralda EcoTurismo</h1>
    </header>
    <div class="contenedor">
        <div class="login">
            <form id="formulario" action="{{ url('/login') }}" method="POST">
                @csrf

                <label for="name">Nombre de usuario o Email:</label>
                <input type="text" id="name" name="name" value="{{ old('name') }}" required autofocus>
                @error('name')
                    <div style="color:red; margin-top: 5px;">{{ $message }}</div>
                @enderror
                @error('credentials')
                    <div style="color:red; margin-top: 5px;">{{ $message }}</div>
                @enderror

                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required minlength="6" maxlength="20">
                <button type="button" id="mostrarContraseña"></button>

                @if(session('status'))
                    <div style="color:green; margin-top: 10px; padding: 10px; background-color: #d4edda; border-radius: 5px;">
                        {{ session('status') }}
                    </div>
                @endif
                
                @if($errors->any())
                    <div style="color:red; margin-top: 10px; padding: 10px; background-color: #f8d7da; border-radius: 5px;">
                        <ul style="margin: 0; padding-left: 20px;">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <p><strong>¿Todavía no tienes cuenta?</strong><br><a href="{{ url('/registro') }}">Regístrate</a></p>

                <button id="btn" type="submit">Iniciar sesión</button>
            </form>
        </div>
        <footer>
            <p>© 2025 Risaralda EcoTurismo</p>
        </footer>
    </div>
    <script type="text/javascript" src="{{ asset('js/login.js') }}"></script>
</body>
</html>