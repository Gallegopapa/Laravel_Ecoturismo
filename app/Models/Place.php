<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Place extends Model
{
    use HasFactory;

    /**
     * Fallback local image by normalized place name.
     */
    private const FALLBACK_IMAGES_BY_NAME = [
        'bioparque mariposario bonita farm' => '/imagenes/ukumari.jpg',
        'parque bioflora en finca turistica los rosales' => '/imagenes/parquecafe.jpg',
        'santuario otun quimbaya' => '/imagenes/paisaje2.jpg',
        'barbas bremen' => '/imagenes/paisaje5.jpg',
        'eco hotel paraiso real' => '/imagenes/paisaje4.jpg',
        'termales de san vicente' => '/imagenes/termales.jpg',
        'voladero el zarzo' => '/imagenes/mirador5.jpg',
        'piedras marcadas' => '/imagenes/piedras5.jpg',
    ];

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
     * Accessor para image - devuelve ruta normalizada y validada
     * Prioridad: /imagenes/ > /storage/places/ > null
     */
    public function getImageAttribute($value)
    {
        if (!$value) {
            return $this->getFallbackImageByName();
        }

        $value = trim((string) $value);
        if (empty($value)) {
            return $this->getFallbackImageByName();
        }

        // Si ya es una URL completa
        if (preg_match('/^https?:\/\//', $value)) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';

            if (strpos($path, '/imagenes/') === 0 || strpos($path, '/storage/') === 0) {
                return $path;
            }

            return $value;
        }

        // PRIORIDAD 1: Si comienza con /imagenes/, devolver tal cual
        if (strpos($value, '/imagenes/') === 0) {
            return $value;
        }

        // Si es almacenamiento de storage public
        if (strpos($value, '/storage/') === 0 || strpos($value, 'storage/') === 0) {
            $cleanPath = str_replace(['storage/', '/storage/'], '', $value);
            return Storage::disk('public')->url(ltrim($cleanPath, '/'));
        }

        // Normalizar rutas sin barra inicial
        if (strpos($value, 'imagenes/') === 0) {
            return asset($value);
        }

        if (strpos($value, 'storage/places/') === 0) {
            return Storage::disk('public')->url(substr($value, strlen('storage/')));
        }

        if (strpos($value, 'places/') === 0) {
            return Storage::disk('public')->url($value);
        }

        // Si el valor es texto no reconocible como ruta de archivo, usar fallback por nombre.
        if (!str_contains($value, '/') && !preg_match('/\.(jpg|jpeg|png|webp|gif|svg)$/i', $value)) {
            $fallback = $this->getFallbackImageByName();
            if ($fallback) {
                return $fallback;
            }
        }

        // Por defecto, intentar en /imagenes/
        return '/imagenes/' . ltrim($value, '/');
    }

    /**
     * Resolve deterministic local image from place name.
     */
    private function getFallbackImageByName(): ?string
    {
        $name = (string) ($this->attributes['name'] ?? '');
        if ($name === '') {
            return null;
        }

        $normalized = Str::lower(Str::ascii($name));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', trim($normalized));

        return self::FALLBACK_IMAGES_BY_NAME[$normalized] ?? null;
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
                    ->withPivot('es_principal')
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