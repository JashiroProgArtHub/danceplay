<?php

namespace App\Http\Controllers;

use App\Models\Dance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Dance::all());
    }

    public function store(Request $request)
    {
        if ($request->has('sourceLink') && !$request->has('source_link')) {
            $request->merge(['source_link' => $request->input('sourceLink')]);
        }
        if ($request->has('uploadLink') && !$request->has('upload_link')) {
            $request->merge(['upload_link' => $request->input('uploadLink')]);
        }
        if ($request->has('coverImage') && !$request->has('cover_image')) {
            $request->merge(['cover_image' => $request->input('coverImage')]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'difficulty' => 'required|string|max:255',
            'status' => 'string',
            'progress' => 'integer',
            'favorite' => 'boolean',
            'source_link' => 'nullable|string',
            'upload_link' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('cover_image')) {
            $request->validate(['cover_image' => 'image|mimes:jpeg,png,jpg,webp|max:2048']);
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $path;
        } else {
            $validated['cover_image'] = $request->input('cover_image');
        }

        $dance = Dance::create($validated);
        return response()->json($dance, 201);
    }

    public function update(Request $request, Dance $dance)
    {
        if ($request->has('sourceLink') && !$request->has('source_link')) {
            $request->merge(['source_link' => $request->input('sourceLink')]);
        }
        if ($request->has('uploadLink') && !$request->has('upload_link')) {
            $request->merge(['upload_link' => $request->input('uploadLink')]);
        }
        if ($request->has('coverImage') && !$request->has('cover_image')) {
            $request->merge(['cover_image' => $request->input('coverImage')]);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'artist' => 'string|max:255',
            'category' => 'string|max:255',
            'difficulty' => 'string|max:255',
            'status' => 'string',
            'progress' => 'integer',
            'favorite' => 'boolean',
            'source_link' => 'nullable|string',
            'upload_link' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('cover_image')) {
            $request->validate(['cover_image' => 'image|mimes:jpeg,png,jpg,webp|max:2048']);
            
            // Delete old image if exists
            if ($dance->cover_image && str_starts_with($dance->cover_image, '/storage/covers/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $dance->cover_image));
            }
            
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $path;
        } elseif ($request->has('cover_image')) {
            $validated['cover_image'] = $request->input('cover_image');
        }

        $dance->update($validated);
        return response()->json($dance, 200);
    }

    public function destroy(Dance $dance): JsonResponse
    {
        if ($dance->cover_image && str_starts_with($dance->cover_image, '/storage/covers/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $dance->cover_image));
        }

        $dance->delete();

        return response()->json(null, 204);
    }
}
