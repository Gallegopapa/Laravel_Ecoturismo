<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public function __construct(private string $token)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', config('app.url'));
        $resetUrl = rtrim($frontendUrl, '/') . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        return (new MailMessage())
            ->subject('Recuperar contrasena')
            ->greeting('Hola')
            ->line('Recibimos una solicitud para restablecer tu contrasena.')
            ->action('Restablecer contrasena', $resetUrl)
            ->line('Si no solicitaste este cambio, puedes ignorar este correo.');
    }
}
