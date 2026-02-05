<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Rules\NoProfanity;

class NoProfanityTest extends TestCase
{
    public function test_blocks_known_profanities()
    {
        $rule = new NoProfanity();

        $this->assertFalse($rule->passes('comment', 'una mierda de atencion'));
        $this->assertFalse($rule->passes('comment', 'hijo de puta, cabron'));
        $this->assertFalse($rule->passes('comment', 'p.u.t.a'));
        $this->assertFalse($rule->passes('comment', 'pútá')); // accent
        $this->assertFalse($rule->passes('comment', 'jódete')); // accent
    }

    public function test_allows_clean_text()
    {
        $rule = new NoProfanity();

        $this->assertTrue($rule->passes('comment', 'me trataron muy bien'));
        $this->assertTrue($rule->passes('comment', 'fantastico lugar, recomendado'));
    }
}
