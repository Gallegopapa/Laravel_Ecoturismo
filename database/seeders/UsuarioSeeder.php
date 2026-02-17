<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSeeder extends Seeder
{
    public function run()
    {
        DB::table('usuarios')->insertOrIgnore(array (
  0 => 
  array (
    'id' => 1,
    'name' => 'TestUser',
    'email' => 'test@example.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$0K2sFc7OrZcBhNk4E2Y3SOCy0bWVdTt2zb6a15ZbTFdDV/MdGlVoK',
    'is_admin' => 1,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2025-12-15 01:06:29',
    'remember_token' => 'OfqnAZr7Ty',
  ),
  1 => 
  array (
    'id' => 2,
    'name' => 'Robin',
    'email' => 'robinejemplo@gmail.com',
    'telefono' => '3217085550',
    'foto_perfil' => '/storage/profiles/1765767144_693f77e8cb5d5.png',
    'password' => '$2y$12$H6j7jIIxhUbNCKptkU42YudzNgnF9kOpXP.f.vJ2LNYyiiSrncrSi',
    'is_admin' => 1,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2025-12-15 01:07:28',
    'remember_token' => NULL,
  ),
  2 => 
  array (
    'id' => 4,
    'name' => 'simon',
    'email' => 'simon.23051997@gmail.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$D3QaQhFx9V4T7zvU16T/EOiVq/EEeh4V6rhkPjLHn71W1dejXhPxG',
    'is_admin' => 0,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-03 12:41:24',
    'remember_token' => NULL,
  ),
  3 => 
  array (
    'id' => 5,
    'name' => 'adrianagmailcomcom',
    'email' => 'adriana@gmail.com.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$oPazCE6Wam9u..rDsaIDke2wqo4FNX14LcXbkvpmp9o6AiBaD7ggK',
    'is_admin' => 0,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-03 13:42:24',
    'remember_token' => NULL,
  ),
  4 => 
  array (
    'id' => 6,
    'name' => 'JeycobAdmin',
    'email' => 'goldarmony8776@gmail.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$qOJa.hhzmWm186Z1mqtJJ.WFVgMIBsKuJ/ZQ0W4gDil5mLAvCzOba',
    'is_admin' => 1,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-10 21:17:17',
    'remember_token' => NULL,
  ),
  5 => 
  array (
    'id' => 7,
    'name' => 'Rodrigo',
    'email' => 'rodri@gmail.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$GW9ZiLxlgMQvLoXAmp2UZ.0UCRx3Qli4CKW.3efPYwIqwO8w7vR3u',
    'is_admin' => 1,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-11 00:49:07',
    'remember_token' => NULL,
  ),
  6 => 
  array (
    'id' => 10,
    'name' => 'juanjo',
    'email' => 'juanjolopin@gmail.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$NC.r1G4ywshAKvZQCKyb6.aBeVwTLToQE.XtvfnlzcTgBOQrWyf2e',
    'is_admin' => 1,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-15 20:17:03',
    'remember_token' => NULL,
  ),
  7 => 
  array (
    'id' => 11,
    'name' => 'sarai',
    'email' => 'sarai@gmail.com',
    'telefono' => NULL,
    'foto_perfil' => NULL,
    'password' => '$2y$12$1tipN4A743nSvRhJttJH1.iNTokf7.wR211G/q/fjJxW7yzilxiTy',
    'is_admin' => 0,
    'tipo_usuario' => 'normal',
    'fecha_registro' => '2026-02-16 00:18:47',
    'remember_token' => NULL,
  ),
));
    }
}
