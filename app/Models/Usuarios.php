<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
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
        $this->notify(new ResetPasswordNotification($token));
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
        
        $path = parse_url((string) $value, PHP_URL_PATH) ?: (string) $value;
        $filename = basename((string) $path);

        if (!$filename) {
            return null;
        }

        // Comprobación de fallback heredado desde la base de datos a raíz de migraciones / legacy code
        if (file_exists(public_path('imagenes/perfiles/' . $filename))) {
            return '/imagenes/perfiles/' . rawurlencode($filename);
        }

        if (file_exists(public_path('imagenes/' . $filename))) {
            return '/imagenes/' . rawurlencode($filename);
        }

        return '/storage/profiles/' . rawurlencode($filename);
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