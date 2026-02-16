<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EcohotelSeeder extends Seeder
{
    public function run()
    {
        DB::table('ecohotels')->insertOrIgnore(array (
));
    }
}
