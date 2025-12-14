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