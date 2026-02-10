<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyPlaceController extends Controller
{
    /**
     * Listar lugares gestionados por el usuario empresa.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompanyUser()) {
            return response()->json([
                'message' => 'No tienes permisos para acceder a este recurso.'
            ], 403);
        }

        $places = $user->placesManaged()
            ->select('places.id', 'places.name', 'places.location')
            ->orderBy('places.name')
            ->get();

        return response()->json($places);
    }
}
