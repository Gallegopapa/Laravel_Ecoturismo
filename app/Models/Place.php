<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    protected $table = 'places';

    protected $fillable = [
        'name',
        'description',
        'location',
        'image',
        'latitude',
        'longitude',
        'telefono',
        'email',
        'sitio_web',
    ];

    /**
     * Accessor para image - devuelve siempre una URL accesible
     */
    public function getImageAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // Si ya es una URL completa, devolverla
        if (preg_match('/^https?:\/\//', $value)) {
            return $value;
        }

        // Si comienza con /storage/, construir URL completa
        if (strpos($value, '/storage/') === 0) {
            return url($value);
        }

        // Si comienza con storage/ sin la barra inicial
        if (strpos($value, 'storage/') === 0) {
            return url('/' . $value);
        }

        // Por defecto, asumir que es solo el nombre de archivo en storage/places
        return url('/storage/places/' . ltrim($value, '/'));
    }

    /**
     * Relación: Un lugar tiene muchas reservas
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'place_id');
    }

    /**
     * Relación: Un lugar tiene muchas reseñas
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'place_id');
    }

    /**
     * Relación: Un lugar pertenece a muchas categorías
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_place');
    }

    /**
     * Relación: Un lugar puede ser favorito de muchos usuarios
     */

    /**
     * Relación muchos a muchos con ecohoteles
     */
    public function ecohoteles()
    {
        return $this->belongsToMany(Ecohotel::class, 'ecohotel_place');
    }
    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'place_id');
    }

    /**
     * Relación: Un lugar tiene muchos horarios
     */
    public function schedules()
    {
        return $this->hasMany(PlaceSchedule::class, 'place_id');
    }

    /**
     * Relación: Un lugar puede estar asignado a múltiples usuarios empresa
     */
    public function companyUsers()
    {
        return $this->belongsToMany(Usuarios::class, 'place_company_users', 'place_id', 'company_user_id')
                    ->withPivot('rol', 'es_principal')
                    ->withTimestamps();
    }

    /**
     * Relación: Un lugar tiene muchas respuestas de empresa a reservas
     */
    public function companyReservations()
    {
        return $this->hasMany(CompanyReservation::class, 'place_id');
    }

    /**
     * Relación: Un lugar tiene muchas asignaciones a usuarios empresa
     */
    public function companyUserAssignments()
    {
        return $this->hasMany(PlaceCompanyUser::class, 'place_id');
    }

    /**
     * Obtener el usuario empresa principal del lugar
     */
    public function getPrincipalCompanyUser()
    {
        return $this->companyUsers()->wherePivot('es_principal', true)->first();
    }

    /**
     * Obtener horarios activos
     */
    public function activeSchedules()
    {
        return $this->hasMany(PlaceSchedule::class, 'place_id')->where('activo', true);
    }

    /**
     * Calcular rating promedio
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Obtener horarios disponibles para un día específico
     */
    public function getSchedulesForDay($diaSemana)
    {
        return $this->activeSchedules()
            ->where('dia_semana', $diaSemana)
            ->get();
    }

    /**
     * Verificar si hay un horario disponible para una fecha y hora específica
     */
    public function hasAvailableSchedule($fecha, $hora)
    {
        $diaNumero = date('w', strtotime($fecha));
        $diasSemana = [
            0 => 'domingo',
            1 => 'lunes',
            2 => 'martes',
            3 => 'miercoles',
            4 => 'jueves',
            5 => 'viernes',
            6 => 'sabado',
        ];

        $diaFecha = $diasSemana[$diaNumero];

        $schedules = $this->activeSchedules()
            ->where('dia_semana', $diaFecha)
            ->get();

        foreach ($schedules as $schedule) {
            if ($schedule->isAvailableFor($fecha, $hora)) {
                return true;
            }
        }

        return false;
    }
}