<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuarios extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'telefono',
        'password',
        'fecha_registro',
        'is_admin',
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
}