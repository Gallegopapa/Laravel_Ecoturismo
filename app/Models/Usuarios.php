<?php

namespace App\Models;


use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuarios extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    protected $table = 'usuarios';

    // CLAVE PRIMARIA (muy importante)
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'telefono',
        'password',
        'fecha_registro',
        'is_admin',
        'tipo_usuario',
        'foto_perfil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'fecha_registro' => 'datetime',
    ];

    public function sendPasswordResetNotification($token): void
    {
        $frontendUrl = env('FRONTEND_URL', config('app.url'));
        $resetUrl = rtrim($frontendUrl, '/') . '/reset-password?token=' . $token . '&email=' . urlencode($this->email);

        $fromName    = env('MAIL_FROM_NAME', 'Risaralda EcoTurismo');
        $fromAddress = env('MAIL_FROM_ADDRESS', 'noreply@sgallego.dev');
        $apiKey      = env('RESEND_API_KEY');

        $html = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
        <tr><td style="background:#2e7d32;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">🌿 Risaralda EcoTurismo</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1b5e20;margin:0 0 16px;">Recuperación de contraseña</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para continuar:</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="' . $resetUrl . '" style="background:#2e7d32;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">Restablecer contraseña</a>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.6;">Este enlace expirará en 60 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;margin:0;">© ' . date('Y') . ' Risaralda EcoTurismo</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>';

        $resend = \Resend::client($apiKey);
        $resend->emails->send([
            'from'    => "{$fromName} <{$fromAddress}>",
            'to'      => [$this->email],
            'subject' => 'Recuperación de contraseña - Risaralda EcoTurismo',
            'html'    => $html,
        ]);
    }


    /**
     * Accessor para foto_perfil
     */
    public function getFotoPerfilAttribute($value)
    {
        if (!$value || $value === "null") {
            return null;
        }

        // Si ya es una URL absoluta válida o data source, devolverla
        if (preg_match('/^https?:\/\//', $value) || strpos($value, 'data:') === 0) {
            return $value;
        }

        // Si ya viene como ruta absoluta relativa al dominio, respetarla tal cual.
        if (strpos($value, '/api/profile/photo/') === 0) {
            return $value;
        }

        $path = parse_url((string) $value, PHP_URL_PATH) ?: (string) $value;
        $filename = basename((string) $path);

        if (!$filename) {
            return null;
        }

        // Devolvemos SIEMPRE el endpoint sin extensión estática para que los Reverse Proxies (Nginx/Apache) no la intercepten.
        return '/api/profile/photo/stream?f=' . rawurlencode($filename);
    }

    /**
     * RELACIONES
     */

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id', 'id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'user_id', 'id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'id');
    }

    public function placesManaged()
    {
        return $this->belongsToMany(
            Place::class,
            'place_company_users',
            'company_user_id',
            'place_id'
        )->withPivot('es_principal')
         ->withTimestamps();
    }

    public function companyReservations()
    {
        return $this->hasMany(CompanyReservation::class, 'company_user_id', 'id');
    }

    public function placeAssignments()
    {
        return $this->hasMany(PlaceCompanyUser::class, 'company_user_id', 'id');
    }

    /**
     * Helpers
     */

    public function isCompanyUser(): bool
    {
        return $this->tipo_usuario === 'empresa';
    }

    public function isAdmin(): bool
    {
        return $this->is_admin || $this->tipo_usuario === 'admin';
    }
}