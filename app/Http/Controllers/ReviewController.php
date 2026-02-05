<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Place;
use App\Rules\NoProfanity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
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

        // Verificar que el usuario no haya comentado antes este lugar
        $existingReview = Review::where('user_id', Auth::id())
            ->where('place_id', $data['place_id'])
            ->first();

        if ($existingReview) {
            return back()->withErrors(['review' => 'Ya has comentado este lugar. Solo puedes comentar una vez por lugar.']);
        }

        Review::create([
            'user_id' => Auth::id(),
            'place_id' => $data['place_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'fecha_comentario' => now(),
        ]);

        return back()->with('status', 'Comentario agregado correctamente.');
    }

    public function destroy(Review $review)
    {
        // Permitir eliminar si es el autor o si el usuario es admin
        $user = Auth::user();
        if ($review->user_id !== $user->id && !$user->is_admin) {
            abort(403);
        }

        $review->delete();
        return back()->with('status', 'Comentario eliminado.');
    }

    public function update(Request $request, Review $review)
    {
        // Solo el autor puede editar su reseña
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        $messages = [
            'comment.max' => 'El comentario no puede exceder los 500 caracteres.',
            'rating.required' => 'La calificación es obligatoria.',
            'rating.integer' => 'La calificación debe ser un número.',
            'rating.min' => 'La calificación mínima es 1.',
            'rating.max' => 'La calificación máxima es 5.',
        ];

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => ['nullable', 'string', 'max:500', new NoProfanity()],
        ], $messages);

        $review->update([
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'fecha_comentario' => now(),
        ]);

        return back()->with('status', 'Comentario actualizado.');
    }
}
