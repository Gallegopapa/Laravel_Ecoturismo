<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Obtener todas las reservas del usuario autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $reservations = Reservation::where('user_id', $user->id)
            ->with(['place', 'usuario:id,name,email,foto_perfil'])
            ->orderBy('fecha_visita', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Obtener todas las reservas (solo para administradores en el futuro)
     * Por ahora, solo devuelve las del usuario autenticado
     */
    public function all(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Solo admin puede ver todas las reservas
        if (!$user->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $reservations = Reservation::with(['place', 'usuario'])
            ->orderBy('fecha_visita', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Crear una nueva reserva
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'place_id' => 'required|exists:places,id',
            'fecha_visita' => 'required|date|after_or_equal:today',
            'hora_visita' => 'nullable|date_format:H:i',
            'personas' => 'required|integer|min:1|max:50',
            'telefono_contacto' => 'nullable|string|max:20',
            'comentarios' => 'nullable|string|max:1000',
            'precio_total' => 'nullable|numeric|min:0',
            'estado' => 'sometimes|string|in:pendiente,confirmada,cancelada',
        ], [
            'place_id.required' => 'El lugar es requerido.',
            'place_id.exists' => 'El lugar seleccionado no existe.',
            'fecha_visita.required' => 'La fecha de visita es requerida.',
            'fecha_visita.date' => 'La fecha de visita debe ser una fecha válida.',
            'fecha_visita.after_or_equal' => 'La fecha de visita debe ser hoy o una fecha futura.',
            'hora_visita.date_format' => 'La hora debe tener el formato HH:mm.',
            'personas.required' => 'El número de personas es requerido.',
            'personas.integer' => 'El número de personas debe ser un número entero.',
            'personas.min' => 'Debe haber al menos 1 persona.',
            'personas.max' => 'No puede haber más de 50 personas.',
            'telefono_contacto.max' => 'El teléfono no puede exceder 20 caracteres.',
            'comentarios.max' => 'Los comentarios no pueden exceder 1000 caracteres.',
            'precio_total.numeric' => 'El precio debe ser un número.',
            'precio_total.min' => 'El precio no puede ser negativo.',
        ]);

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'place_id' => $data['place_id'],
            'fecha_reserva' => now(),
            'fecha_visita' => $data['fecha_visita'],
            'hora_visita' => $data['hora_visita'] ?? null,
            'fecha' => $data['fecha_visita'], // Mantener compatibilidad
            'personas' => $data['personas'],
            'telefono_contacto' => $data['telefono_contacto'] ?? null,
            'comentarios' => $data['comentarios'] ?? null,
            'precio_total' => $data['precio_total'] ?? null,
            'estado' => $data['estado'] ?? 'pendiente',
        ]);

        $reservation->load(['place', 'usuario']);

        return response()->json([
            'message' => 'Reserva creada correctamente.',
            'reservation' => $reservation
        ], 201);
    }

    /**
     * Obtener una reserva específica
     */
    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario autenticado
        if ($reservation->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $reservation->load(['place', 'usuario']);

        return response()->json($reservation);
    }

    /**
     * Actualizar una reserva
     */
    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario autenticado
        if ($reservation->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'fecha_visita' => 'sometimes|date|after_or_equal:today',
            'hora_visita' => 'nullable|date_format:H:i',
            'personas' => 'sometimes|integer|min:1|max:50',
            'telefono_contacto' => 'nullable|string|max:20',
            'comentarios' => 'nullable|string|max:1000',
            'precio_total' => 'nullable|numeric|min:0',
            'estado' => 'sometimes|string|in:pendiente,confirmada,cancelada',
        ], [
            'fecha_visita.date' => 'La fecha de visita debe ser una fecha válida.',
            'fecha_visita.after_or_equal' => 'La fecha de visita debe ser hoy o una fecha futura.',
            'hora_visita.date_format' => 'La hora debe tener el formato HH:mm.',
            'personas.integer' => 'El número de personas debe ser un número entero.',
            'personas.min' => 'Debe haber al menos 1 persona.',
            'personas.max' => 'No puede haber más de 50 personas.',
            'telefono_contacto.max' => 'El teléfono no puede exceder 20 caracteres.',
            'comentarios.max' => 'Los comentarios no pueden exceder 1000 caracteres.',
            'precio_total.numeric' => 'El precio debe ser un número.',
            'precio_total.min' => 'El precio no puede ser negativo.',
        ]);

        // Si se actualiza fecha_visita, también actualizar fecha para compatibilidad
        if (isset($data['fecha_visita'])) {
            $data['fecha'] = $data['fecha_visita'];
        }

        $reservation->update($data);
        $reservation->load(['place', 'usuario']);

        return response()->json($reservation);
    }

    /**
     * Eliminar una reserva
     */
    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Verificar que la reserva pertenece al usuario autenticado
        if ($reservation->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reserva eliminada correctamente'], 200);
    }

    /**
     * Obtener reservas del usuario autenticado
     */
    public function myReservations(Request $request): JsonResponse
    {
        $user = $request->user();
        $reservations = Reservation::where('user_id', $user->id)
            ->with(['place', 'usuario:id,name,email,foto_perfil'])
            ->orderBy('fecha_visita', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }
}