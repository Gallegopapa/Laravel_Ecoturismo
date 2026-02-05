<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class NoProfanity implements Rule
{
    protected $words = [];
    protected $matchWhole = true;

    public function __construct()
    {
        $config = config('profanity.words', []);
        $this->words = is_array($config) ? $config : [];
        $this->matchWhole = config('profanity.match_whole_words', true);
    }

    public function passes($attribute, $value)
    {
        if (empty($value)) {
            return true;
        }
        // Normalizar texto y palabras: pasar a minúsculas, quitar acentos y
        // convertir cualquier caracter no alfanumérico a espacios para evitar
        // evasiones tipo "p.u.t.a" o "pútá".
        $normalize = function ($s) {
            $s = mb_strtolower($s);
            $map = [
                'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
                'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
                'ä' => 'a', 'ë' => 'e', 'ï' => 'i', 'ö' => 'o', 'ü' => 'u',
                'ñ' => 'n', 'ç' => 'c'
            ];
            $s = strtr($s, $map);
            // Reemplazar cualquier caracter que no sea letra o número por espacio
            $s = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $s);
            // Colapsar espacios
            $s = preg_replace('/\s+/u', ' ', $s);
            return trim($s);
        };

        $text = $normalize($value);

        if (empty($this->words)) {
            return true;
        }

        $normalizedWords = array_map(function ($w) use ($normalize) {
            return $normalize($w);
        }, $this->words);

        $escaped = array_map(function ($w) {
            return preg_quote($w, '/');
        }, $normalizedWords);

        $pattern = implode('|', $escaped);

        if ($this->matchWhole) {
            $regex = '/(?:^|\s)(' . $pattern . ')(?:$|\s)/iu';
        } else {
            $regex = '/(' . $pattern . ')/iu';
        }

        // Primera comprobación sobre el texto normalizado (con espacios)
        if (preg_match($regex, ' ' . $text . ' ')) {
            return false;
        }

        // Comprobación adicional para evasiones que insertan separadores
        // entre letras (p.u.t.a => p u t a). Colapsamos espacios y
        // comprobamos subcadenas.
        $collapsed = preg_replace('/\s+/u', '', $text);
        foreach ($normalizedWords as $w) {
            $wCollapsed = preg_replace('/\s+/u', '', $w);
            if ($wCollapsed !== '' && mb_stripos($collapsed, $wCollapsed) !== false) {
                return false;
            }
        }

        return true;
    }

    public function message()
    {
        return 'El comentario contiene palabras inapropiadas.';
    }
}
