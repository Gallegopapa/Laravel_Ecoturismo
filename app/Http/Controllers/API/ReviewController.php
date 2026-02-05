<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Rules\NoProfanity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Obtener todas las reseñas (público)
     */
    public function all(): JsonResponse
    {
        $reviews = Review::with(['usuario:id,name,foto_perfil', 'place:id,name,location'])
            ->orderBy('fecha_comentario', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function index(Request $request, $placeId): JsonResponse
    {
        $reviews = Review::where('place_id', $placeId)
            ->with('usuario:id,name,foto_perfil')
            ->orderBy('fecha_comentario', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Verificar que el usuario no haya comentado antes este lugar
        $existingReview = Review::where('user_id', $user->id)
            ->where('place_id', $request->place_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Ya has comentado este lugar. Solo puedes comentar una vez por lugar.'
            ], 422);
        }

        $messages = [
            'comment.max' => 'El comentario no puede exceder los 500 caracteres.',
            'rating.required' => 'La calificación es obligatoria.',
            'rating.integer' => 'La calificación debe ser un número.',
            'rating.min' => 'La calificación mínima es 1.',
            'rating.max' => 'La calificación máxima es 5.',
        ];

        $data = $request->validate([
            'place_id' => 'required|exists:places,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => ['nullable', 'string', 'max:500', new NoProfanity()],
        ], $messages);

        $review = Review::create([
            'user_id' => $user->id,
            'place_id' => $data['place_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'fecha_comentario' => now(),
        ]);

        $review->load('usuario:id,name,foto_perfil');

        return response()->json($review, 201);
    }

    /**
     * Actualizar una reseña existente
     * - Solo el autor puede editar su reseña
     * - El administrador no edita aquí; puede eliminar cualquier reseña
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        // Solo el autor puede editar
        if ($review->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $messages = [
            'comment.max' => 'El comentario no puede exceder los 500 caracteres.',
            'rating.integer' => 'La calificación debe ser un número.',
            'rating.min' => 'La calificación mínima es 1.',
            'rating.max' => 'La calificación máxima es 5.',
            'place_id.exists' => 'El lugar seleccionado no existe.',
        ];

        $data = $request->validate([
            'place_id' => 'sometimes|exists:places,id',
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => ['nullable', 'string', 'max:500', new NoProfanity()],
        ], $messages);

        if (array_key_exists('place_id', $data) && $data['place_id'] !== $review->place_id) {
            $alreadyReviewed = Review::where('user_id', $user->id)
                ->where('place_id', $data['place_id'])
                ->where('id', '!=', $review->id)
                ->exists();

            if ($alreadyReviewed) {
                return response()->json([
                    'message' => 'Ya has comentado este lugar. Solo puedes comentar una vez por lugar.'
                ], 422);
            }

            $review->place_id = $data['place_id'];
        }

        if (array_key_exists('rating', $data)) {
            $review->rating = $data['rating'];
        }

        if (array_key_exists('comment', $data)) {
            $review->comment = $data['comment'];
        }

        // Opcional: actualizar fecha de comentario al momento de la edición
        $review->fecha_comentario = now();
        $review->save();

        $review->load('usuario:id,name,foto_perfil', 'place:id,name,location');

        return response()->json($review);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        // El autor puede eliminar su reseña.
        // El administrador puede eliminar cualquier reseña.
        if ($review->user_id !== $user->id && !$user->is_admin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Comentario eliminado']);
    }
}
