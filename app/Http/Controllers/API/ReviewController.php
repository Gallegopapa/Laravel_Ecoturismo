<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Obtener todas las reseñas (público)
     */
    public function all(): JsonResponse
    {
        $reviews = Review::with(['usuario:id,name', 'place:id,name,location'])
            ->orderBy('fecha_comentario', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function index(Request $request, $placeId): JsonResponse
    {
        $reviews = Review::where('place_id', $placeId)
            ->with('usuario:id,name')
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

        $data = $request->validate([
            'place_id' => 'required|exists:places,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $user->id,
            'place_id' => $data['place_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'fecha_comentario' => now(),
        ]);

        $review->load('usuario:id,name');

        return response()->json($review, 201);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        if ($review->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Comentario eliminado']);
    }
}
