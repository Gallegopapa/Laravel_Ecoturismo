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
     * Accessor para foto_perfil - Asegura que siempre devuelva una URL completa
     */
    public function getFotoPerfilAttribute($value)
    {
        if (!$value) {
            return null;
        }
        
        // Si ya es una URL completa (http/https), devolverla tal cual
        if (preg_match('/^https?:\/\//', $value)) {
            return $value;
        }
        
        // Si comienza con /storage/, devolver URL completa
        if (strpos($value, '/storage/') === 0) {
            return url($value);
        }
        
        // Si es solo el nombre del archivo, construir la ruta completa
        if (strpos($value, 'storage/') === 0) {
            return url('/' . $value);
        }
        
        // Por defecto, asumir que está en storage/profiles/
        return url('/storage/profiles/' . $value);
    }

    /**
     * Relación: Un usuario tiene muchas reservas
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id');
    }

    /**
     * Relación: Un usuario tiene muchas reseñas
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    /**
     * Relación: Un usuario tiene muchos favoritos
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'user_id');
    }

    /**
     * Relación: Un usuario tiene muchos pagos
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    /**
     * Relación: Un usuario empresa puede gestionar múltiples lugares
     */
    public function placesManaged()
    {
        return $this->belongsToMany(Place::class, 'place_company_users', 'company_user_id', 'place_id')
                    ->withPivot('es_principal')
                    ->withTimestamps();
    }

    /**
     * Relación: Un usuario empresa tiene muchas respuestas a reservas
     */
    public function companyReservations()
    {
        return $this->hasMany(CompanyReservation::class, 'company_user_id');
    }

    /**
     * Relación: Un usuario empresa tiene muchas asignaciones a lugares
     */
    public function placeAssignments()
    {
        return $this->hasMany(PlaceCompanyUser::class, 'company_user_id');
    }

    /**
     * Verificar si el usuario es de tipo empresa
     */
    public function isCompanyUser(): bool
    {
        return $this->tipo_usuario === 'empresa';
    }

    /**
     * Verificar si el usuario es administrador
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->tipo_usuario === 'admin';
    }
}