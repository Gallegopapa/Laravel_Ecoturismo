<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Place;
use App\Models\Category;

class PlaceController extends Controller
{
    /**
     * Obtener todos los lugares (público)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Place::query();
        
        // Filtrar por categoría si se proporciona
        if ($request->has('category_id')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }
        
        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }
        
        $places = $query->with(['categories', 'reviews.usuario:id,name,foto_perfil'])
            ->orderBy('name', 'asc')
            ->get();
        
        // Agregar información de rating a cada lugar
        $places->transform(function($place) {
            $place->average_rating = round($place->reviews->avg('rating') ?? 0, 1);
            $place->reviews_count = $place->reviews->count();
            return $place;
        });
        
        return response()->json($places);
    }


    /**
     * Obtener horarios disponibles para un lugar en una fecha específica
     */
    public function getAvailableSchedules(Request $request, Place $place): JsonResponse
    {
        $request->validate([
            'fecha' => 'required|date|after_or_equal:today',
        ]);

        $fecha = $request->input('fecha');
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

        // Obtener horarios del día
        $schedules = $place->activeSchedules()
            ->where('dia_semana', $diaFecha)
            ->orderBy('hora_inicio')
            ->get();

        // Obtener reservas existentes para esa fecha
        $reservasExistentes = \App\Models\Reservation::where('place_id', $place->id)
            ->where('fecha_visita', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->pluck('hora_visita')
            ->toArray();

        // Filtrar horarios disponibles (excluir los que ya tienen reserva)
        $horariosDisponibles = [];
        foreach ($schedules as $schedule) {
            // Convertir horas HH:mm a segundos desde medianoche
            $horaInicioSegundos = $this->timeToSeconds($schedule->hora_inicio);
            $horaFinSegundos = $this->timeToSeconds($schedule->hora_fin);
            
            // Generar horarios cada 30 minutos dentro del rango
            $horaActualSegundos = $horaInicioSegundos;
            while ($horaActualSegundos <= $horaFinSegundos) {
                $horaFormato = $this->secondsToTime($horaActualSegundos);
                
                // Verificar que no esté ya reservada
                if (!in_array($horaFormato, $reservasExistentes)) {
                    $horariosDisponibles[] = [
                        'hora' => $horaFormato,
                        'hora_display' => $this->formatTimeDisplay($horaActualSegundos),
                    ];
                }
                
                $horaActualSegundos += 1800; // Sumar 30 minutos (1800 segundos)
            }
        }

        return response()->json([
            'fecha' => $fecha,
            'dia_semana' => $diaFecha,
            'horarios_disponibles' => $horariosDisponibles,
        ]);
    }

    /**
     * Convertir hora en formato HH:mm a segundos desde medianoche
     */
    private function timeToSeconds($time)
    {
        $parts = explode(':', $time);
        return (int)$parts[0] * 3600 + (int)$parts[1] * 60;
    }

    /**
     * Convertir segundos desde medianoche a formato HH:mm
     */
    private function secondsToTime($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        return sprintf('%02d:%02d', $hours, $minutes);
    }

    /**
     * Formatear tiempo para mostrar (12 horas con AM/PM)
     */
    private function formatTimeDisplay($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $period = $hours >= 12 ? 'PM' : 'AM';
        $displayHours = $hours > 12 ? $hours - 12 : ($hours == 0 ? 12 : $hours);
        return sprintf('%d:%02d %s', $displayHours, $minutes, $period);
    }

    /**
     * Crear un nuevo lugar
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'name.required' => 'El nombre del lugar es requerido.',
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        $place = Place::create($data);
        
        // Asociar categorías si se proporcionan
        if (isset($data['categories'])) {
            $place->categories()->sync($data['categories']);
        }
        
        $place->load('categories');
        
        return response()->json([
            'message' => 'Lugar creado correctamente.',
            'place' => $place
        ], 201);
    }

    /**
     * Obtener un lugar específico (público) con sus horarios
     */
    public function show(Request $request, Place $place): JsonResponse
    {
        // Cargar relaciones necesarias
        $place->load([
            'reviews.usuario:id,name,foto_perfil', 
            'categories', 
            'schedules' => function($query) {
                $query->where('activo', true)
                      ->orderByRaw("
                          CASE dia_semana
                              WHEN 'lunes' THEN 1
                              WHEN 'martes' THEN 2
                              WHEN 'miercoles' THEN 3
                              WHEN 'jueves' THEN 4
                              WHEN 'viernes' THEN 5
                              WHEN 'sabado' THEN 6
                              WHEN 'domingo' THEN 7
                          END
                      ")
                      ->orderBy('hora_inicio');
            }
        ]);
        
        // Calcular rating promedio
        $averageRating = $place->reviews->avg('rating') ?? 0;
        $reviewsCount = $place->reviews->count();
        
        // Cargar TODAS las reservas futuras del lugar para mostrar horarios ocupados (público)
        $futureReservations = \App\Models\Reservation::where('place_id', $place->id)
            ->where('fecha_visita', '>=', now()->toDateString())
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_visita')
            ->orderBy('hora_visita')
            ->get()
            ->map(function($reservation) {
                // Asegurar que hora_visita sea un string en formato H:i
                $horaVisita = $reservation->hora_visita;
                if ($horaVisita instanceof \Carbon\Carbon) {
                    $horaVisita = $horaVisita->format('H:i');
                } elseif (is_string($horaVisita) && strlen($horaVisita) > 5) {
                    // Si viene como "HH:MM:SS", tomar solo "HH:MM"
                    $horaVisita = substr($horaVisita, 0, 5);
                }
                
                return [
                    'id' => $reservation->id,
                    'fecha_visita' => $reservation->fecha_visita->format('Y-m-d'),
                    'hora_visita' => $horaVisita,
                    'personas' => $reservation->personas,
                    'estado' => $reservation->estado,
                ];
            });
        
        return response()->json([
            'place' => $place,
            'average_rating' => round($averageRating, 1),
            'reviews_count' => $reviewsCount,
            'future_reservations' => $futureReservations,
        ]);
    }

    /**
     * Actualizar un lugar
     */
    public function update(Request $request, Place $place): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ], [
            'categories.array' => 'Las categorías deben ser un array.',
            'categories.*.exists' => 'Una o más categorías no existen.',
        ]);

        $place->update($data);
        
        // Actualizar categorías si se proporcionan
        if (isset($data['categories'])) {
            $place->categories()->sync($data['categories']);
        }
        
        $place->load('categories');
        
        return response()->json([
            'message' => 'Lugar actualizado correctamente.',
            'place' => $place
        ]);
    }

    /**
     * Eliminar un lugar
     */
    public function destroy(Place $place): JsonResponse
    {
        $place->delete();
        return response()->json(['message' => 'Lugar eliminado correctamente'], 200);
    }
}