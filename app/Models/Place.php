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
    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'place_id');
    }

    /**
     * Calcular rating promedio
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }
}