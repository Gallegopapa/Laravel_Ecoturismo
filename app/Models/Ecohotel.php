<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ecohotel extends Model
{
    use HasFactory;

    /**
     * Reseñas directas de ecohotel
     */
    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'ecohotel_id');
    }

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

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * Accessor para image - devuelve ruta normalizada y validada
     * Prioridad: /imagenes/ > /storage/ecohotels/ > null
     */
    public function getImageAttribute($value)
    {
        if (!$value) {
            return null;
        }

        $value = trim((string) $value);
        if (empty($value)) {
            return null;
        }

        if (preg_match('/^https?:\/\//', $value)) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';
            if (strpos($path, '/imagenes/') === 0 || strpos($path, '/storage/') === 0) {
                return $path;
            }
            return $value;
        }

        if (strpos($value, '/imagenes/') === 0) {
            return $value;
        }

        if (strpos($value, '/storage/') === 0 || strpos($value, 'storage/') === 0) {
            $cleanPath = str_replace(['storage/', '/storage/'], '', $value);
            return '/storage/' . ltrim($cleanPath, '/');
        }

        if (strpos($value, 'imagenes/') === 0) {
            return '/' . $value;
        }

        if (strpos($value, 'storage/ecohotels/') === 0) {
            return '/storage/' . substr($value, strlen('storage/'));
        }

        if (strpos($value, 'ecohotels/') === 0) {
            return '/storage/' . $value;
        }

        return '/imagenes/' . ltrim($value, '/');
    }

    /**
     * Relación muchos a muchos con categorías
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_ecohotel');
    }

    /**
     * Relación muchos a muchos con lugares turísticos
     */
    public function places()
    {
        return $this->belongsToMany(Place::class, 'ecohotel_place');
    }
}
