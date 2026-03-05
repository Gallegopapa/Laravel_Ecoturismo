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
        if (!$value) {
            return null;
        }

        if (preg_match('/^https?:\/\//', $value)) {
            return $value;
        }

        if (strpos($value, '/storage/') === 0) {
            return url($value);
        }

        if (strpos($value, 'storage/') === 0) {
            return url('/' . $value);
        }

        return url('/storage/profiles/' . $value);
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