<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Pruebas de Feature para Autenticación
 * Cubre: registro, login, logout, usuario actual y verificación de token.
 */
class AuthFeatureTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /** Crea y devuelve un usuario de prueba ya persistido. */
    private function createUser(array $overrides = []): Usuarios
    {
        return Usuarios::create(array_merge([
            'name'           => 'usuario' . Str::random(4),
            'email'          => Str::random(5) . '@gmail.com',
            'password'       => Hash::make('Password1!'),
            'fecha_registro' => now(),
            'is_admin'       => false,
        ], $overrides));
    }

    /** Datos mínimos válidos para registro. */
    private function validRegisterPayload(array $overrides = []): array
    {
        $base = 'testuser' . Str::random(4);
        return array_merge([
            'name'                  => $base,
            'email'                 => $base . '@gmail.com',
            'password'              => 'Password1!',
            'password_confirmation' => 'Password1!',
        ], $overrides);
    }

    // ─────────────────────────────────────────────────────────────
    // REGISTRO
    // ─────────────────────────────────────────────────────────────

    /** Un nuevo usuario puede registrarse con datos válidos. */
    public function test_user_can_register_with_valid_data()
    {
        $payload = $this->validRegisterPayload();

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'name', 'email', 'is_admin'],
                     'token',
                     'token_type',
                 ]);

        $this->assertDatabaseHas('usuarios', [
            'name'  => $payload['name'],
            'email' => strtolower($payload['email']),
        ]);
    }

    /** El registro devuelve un token Bearer utilizable. */
    public function test_register_returns_usable_bearer_token()
    {
        $payload  = $this->validRegisterPayload();
        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $token = $response->json('token');

        $this->assertNotNull($token);
        $this->assertIsString($token);

        // El token debe permitir acceder a rutas protegidas
        $this->getJson('/api/user', ['Authorization' => 'Bearer ' . $token])
             ->assertStatus(200);
    }

    /** No se permite registrarse con un correo que no sea @gmail.com. */
    public function test_register_rejects_non_gmail_email()
    {
        $payload = $this->validRegisterPayload(['email' => 'usuario@hotmail.com']);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('email');
    }

    /** No se permite registrarse con un nombre que ya existe (case-insensitive). */
    public function test_register_rejects_duplicate_name()
    {
        $existing = $this->createUser(['name' => 'UnicoNombre']);

        $payload = $this->validRegisterPayload(['name' => $existing->name]);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('name');
    }

    /** No se permite registrarse con un correo que ya existe. */
    public function test_register_rejects_duplicate_email()
    {
        $existing = $this->createUser();

        $payload = $this->validRegisterPayload([
            'name'  => 'otrousr' . Str::random(4),
            'email' => $existing->email,
        ]);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('email');
    }

    /** Contraseñas que no coinciden son rechazadas. */
    public function test_register_rejects_mismatched_passwords()
    {
        $payload = $this->validRegisterPayload([
            'password_confirmation' => 'OtraPassword2!',
        ]);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('password');
    }

    /** Contraseña muy corta (< 8 chars) es rechazada. */
    public function test_register_rejects_short_password()
    {
        $payload = $this->validRegisterPayload([
            'password'              => 'abc',
            'password_confirmation' => 'abc',
        ]);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('password');
    }

    /** Contraseña muy larga (> 15 chars) es rechazada. */
    public function test_register_rejects_too_long_password()
    {
        $payload = $this->validRegisterPayload([
            'password'              => 'EstaPasswordEsMuyLarga123!',
            'password_confirmation' => 'EstaPasswordEsMuyLarga123!',
        ]);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('password');
    }

    /** Nombre con caracteres especiales (ej. espacios) es rechazado. */
    public function test_register_rejects_name_with_special_characters()
    {
        $payload = $this->validRegisterPayload(['name' => 'nombre invalido!']);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('name');
    }

    /** Nombre muy corto (< 3 chars) es rechazado. */
    public function test_register_rejects_too_short_name()
    {
        $payload = $this->validRegisterPayload(['name' => 'ab']);

        $this->postJson('/api/register', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrorFor('name');
    }

    /** Campos obligatorios vacíos retornan 422. */
    public function test_register_requires_all_fields()
    {
        $this->postJson('/api/register', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    // ─────────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────────

    /** Un usuario puede iniciar sesión con su correo. */
    public function test_user_can_login_with_email()
    {
        $user = $this->createUser(['password' => Hash::make('MiPassword1!')]);

        $response = $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'MiPassword1!',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'name', 'email'],
                     'token',
                     'token_type',
                 ]);
    }

    /** Un usuario puede iniciar sesión con su nombre de usuario. */
    public function test_user_can_login_with_username()
    {
        $user = $this->createUser(['password' => Hash::make('MiPassword1!')]);

        $response = $this->postJson('/api/login', [
            'login'    => $user->name,
            'password' => 'MiPassword1!',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => $user->name]);
    }

    /** El login acepta el campo "email" directamente además de "login". */
    public function test_user_can_login_using_email_field()
    {
        $user = $this->createUser(['password' => Hash::make('MiPassword1!')]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'MiPassword1!',
        ])->assertStatus(200);
    }

    /** El login es insensible a mayúsculas en email/nombre. */
    public function test_login_is_case_insensitive()
    {
        $user = $this->createUser(['password' => Hash::make('MiPassword1!')]);

        $this->postJson('/api/login', [
            'login'    => strtoupper($user->email),
            'password' => 'MiPassword1!',
        ])->assertStatus(200);
    }

    /** Contraseña incorrecta devuelve 401. */
    public function test_login_fails_with_wrong_password()
    {
        $user = $this->createUser();

        $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'ContraseñaIncorrecta!',
        ])->assertStatus(401)
          ->assertJsonFragment(['message' => 'Credenciales incorrectas']);
    }

    /** Usuario inexistente devuelve 401. */
    public function test_login_fails_with_nonexistent_user()
    {
        $this->postJson('/api/login', [
            'login'    => 'noexiste@gmail.com',
            'password' => 'Password1!',
        ])->assertStatus(401);
    }

    /** Login sin contraseña devuelve 422. */
    public function test_login_requires_password()
    {
        $this->postJson('/api/login', [
            'login' => 'alguien@gmail.com',
        ])->assertStatus(422)
          ->assertJsonValidationErrorFor('password');
    }

    /** Login sin credencial de usuario devuelve 422. */
    public function test_login_requires_login_field()
    {
        $this->postJson('/api/login', [
            'password' => 'Password1!',
        ])->assertStatus(422);
    }

    /** Un nuevo login invalida los tokens anteriores del usuario. */
    public function test_login_invalidates_previous_tokens()
    {
        $user = $this->createUser(['password' => Hash::make('Password1!')]);

        // Primer login
        $first = $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'Password1!',
        ]);
        $firstToken = $first->json('token');

        // Segundo login (debe revocar el primero)
        $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'Password1!',
        ])->assertStatus(200);

        // El primer token ya no debe ser válido
        $this->getJson('/api/user', ['Authorization' => 'Bearer ' . $firstToken])
             ->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────────────────────

    /** Un usuario autenticado puede cerrar su sesión actual. */
    public function test_authenticated_user_can_logout()
    {
        $user = $this->createUser(['password' => Hash::make('Password1!')]);

        // Obtenemos un token real via el endpoint de login
        $loginResponse = $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'Password1!',
        ]);
        $token = $loginResponse->json('token');

        $this->postJson('/api/logout', [], ['Authorization' => 'Bearer ' . $token])
             ->assertStatus(200)
             ->assertJsonFragment(['message' => 'Sesión cerrada correctamente']);
    }

    /** Un usuario autenticado puede cerrar todas sus sesiones. */
    public function test_authenticated_user_can_logout_all_sessions()
    {
        $user = $this->createUser(['password' => Hash::make('Password1!')]);

        // Obtenemos un token real via el endpoint de login
        $loginResponse = $this->postJson('/api/login', [
            'login'    => $user->email,
            'password' => 'Password1!',
        ]);
        $token = $loginResponse->json('token');

        $this->postJson('/api/logout-all', [], ['Authorization' => 'Bearer ' . $token])
             ->assertStatus(200)
             ->assertJsonFragment(['message' => 'Todas las sesiones cerradas']);
    }

    /** Un invitado (sin token) no puede cerrar sesión. */
    public function test_guest_cannot_logout()
    {
        $this->postJson('/api/logout')
             ->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // USUARIO ACTUAL (/api/user)
    // ─────────────────────────────────────────────────────────────

    /** /api/user devuelve datos del usuario autenticado. */
    public function test_me_returns_authenticated_user_data()
    {
        $user = $this->createUser();

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/user')
             ->assertStatus(200)
             ->assertJsonFragment([
                 'id'    => $user->id,
                 'name'  => $user->name,
                 'email' => $user->email,
             ]);
    }

    /** Un invitado no puede acceder a /api/user. */
    public function test_guest_cannot_access_me_endpoint()
    {
        $this->getJson('/api/user')
             ->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // VERIFICAR TOKEN (/api/verify-token)
    // ─────────────────────────────────────────────────────────────

    /** Un token válido responde con valid = true. */
    public function test_valid_token_passes_verification()
    {
        $user = $this->createUser();

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/verify-token')
             ->assertStatus(200)
             ->assertJsonFragment(['valid' => true]);
    }

    /** Sin token, la verificación devuelve 401. */
    public function test_missing_token_fails_verification()
    {
        $this->getJson('/api/verify-token')
             ->assertStatus(401);
    }
}
