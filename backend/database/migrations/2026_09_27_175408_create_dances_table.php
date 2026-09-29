<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dances', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('artist');
            $table->string('category');
            $table->string('difficulty');
            $table->string('status')->default('Learning');
            $table->integer('progress')->default(0);
            $table->boolean('favorite')->default(false);
            $table->string('cover_image')->nullable();
            $table->string('source_link')->nullable();
            $table->string('upload_link')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dances');
    }
};
