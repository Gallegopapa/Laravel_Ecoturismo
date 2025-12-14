<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PlaceController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\AdminPlaceController;
use App\Http\Controllers\API\AdminUserController;

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas públicas de lugares
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/{place}', [PlaceController::class, 'show']);

// Rutas públicas de categorías
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Rutas públicas de reseñas por lugar
Route::get('/places/{placeId}/reviews', [ReviewController::class, 'index']);

// Envío de mensajes (público, pero puede incluir user_id si está autenticado)
Route::post('/messages', [MessageController::class, 'store']);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación con Sanctum)
// ============================================
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/verify-token', [AuthController::class, 'verifyToken']);
    
    // Perfil de usuario
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    
    // Rutas de lugares (CRUD completo - solo admin)
    Route::post('/places', [PlaceController::class, 'store'])->middleware('admin');
    Route::put('/places/{place}', [PlaceController::class, 'update'])->middleware('admin');
    Route::delete('/places/{place}', [PlaceController::class, 'destroy'])->middleware('admin');
    
    // Rutas de categorías (CRUD completo - solo admin)
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('admin');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('admin');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('admin');
    
    // Rutas de reservas
    Route::get('/reservations/my', [ReservationController::class, 'myReservations']);
    Route::apiResource('reservations', ReservationController::class);
    
    // Rutas de comentarios/reseñas
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    
    // Rutas de favoritos
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/favorites/check/{placeId}', [FavoriteController::class, 'check']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{placeId}', [FavoriteController::class, 'destroy']);
    
    // Rutas de pagos (BOCETO)
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    
    // ============================================
    // RUTAS DE ADMIN API (requieren autenticación + admin)
    // ============================================
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Rutas de lugares para admin
        Route::get('/places', [AdminPlaceController::class, 'index']);
        Route::get('/places/{place}', [AdminPlaceController::class, 'show']);
        Route::post('/places', [AdminPlaceController::class, 'store']);
        Route::put('/places/{place}', [AdminPlaceController::class, 'update']);
        Route::delete('/places/{place}', [AdminPlaceController::class, 'destroy']);
        
        // Rutas de usuarios para admin
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    });
});