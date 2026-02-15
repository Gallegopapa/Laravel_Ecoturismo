<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ecohotel extends Model
{
    use HasFactory;

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
