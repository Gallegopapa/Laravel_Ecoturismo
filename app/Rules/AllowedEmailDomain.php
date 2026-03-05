<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AllowedEmailDomain implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Dominios permitidos
        $allowedDomains = ['gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com'];
        
        // Extraer el dominio del email
        $emailParts = explode('@', strtolower($value));
        
        // Validar que tenga exactamente 2 partes (usuario@dominio)
        if (count($emailParts) !== 2) {
            $fail('El correo electrónico debe contener un @ válido.');
            return;
        }
        
        // Validar que el dominio esté en la lista de permitidos
        if (!in_array($emailParts[1], $allowedDomains)) {
            $fail('Solo se permiten correos de Gmail (@gmail.com), Hotmail (@hotmail.com o @hotmail.es) u Outlook (@outlook.com).');
        }
    }
}
