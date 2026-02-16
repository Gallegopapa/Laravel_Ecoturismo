<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reverse the polymorphic reviews table to separate place_id and ecohotel_id.
     */
    public function up(): void
    {
        // Eliminar todos los constraints llamados unique_user_reviewable (pueden ser duplicados por errores previos)
        // Intentar eliminar cualquier foreign key que dependa de unique_user_reviewable (por si acaso)
        $fkConstraints = \DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'ecoturismo' AND TABLE_NAME = 'reviews' AND CONSTRAINT_NAME != 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL");
        foreach ($fkConstraints as $fk) {
            \DB::statement("ALTER TABLE reviews DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
        }
        // Eliminar el índice unique_user_reviewable
        $constraints = \DB::select("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = 'ecoturismo' AND TABLE_NAME = 'reviews' AND CONSTRAINT_NAME = 'unique_user_reviewable'");
        foreach ($constraints as $c) {
            \DB::statement("ALTER TABLE reviews DROP INDEX `{$c->CONSTRAINT_NAME}`");
        }
        // Ahora usar Blueprint para el resto
        Schema::table('reviews', function (Blueprint $table) {
            try { $table->dropIndex(['reviewable_id', 'reviewable_type']); } catch (\Exception $e) {}
            if (Schema::hasColumn('reviews', 'reviewable_id')) $table->dropColumn('reviewable_id');
            if (Schema::hasColumn('reviews', 'reviewable_type')) $table->dropColumn('reviewable_type');

            $table->unsignedBigInteger('place_id')->nullable()->after('user_id');
            $table->unsignedBigInteger('ecohotel_id')->nullable()->after('place_id');
            $table->foreign('place_id')->references('id')->on('places')->onDelete('cascade');
            $table->foreign('ecohotel_id')->references('id')->on('ecohotels')->onDelete('cascade');
            $table->unique(['user_id', 'place_id']);
            $table->unique(['user_id', 'ecohotel_id']);
        });
    }

    /**
     * Revert the changes (volver a polimórfico si se hace rollback).
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'place_id']);
            $table->dropUnique(['user_id', 'ecohotel_id']);
            $table->dropForeign(['place_id']);
            $table->dropForeign(['ecohotel_id']);
            $table->dropColumn(['place_id', 'ecohotel_id']);
            $table->unsignedBigInteger('reviewable_id')->nullable();
            $table->string('reviewable_type')->nullable();
            $table->index(['reviewable_id', 'reviewable_type']);
            $table->unique(['user_id', 'reviewable_id', 'reviewable_type'], 'unique_user_reviewable');
        });
    }
};
