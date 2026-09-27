<?php

namespace App\Http\Controllers;

use App\Models\Dance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Dance::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'difficulty' => 'required|string|max:255',
            'status' => 'nullable|string|max:255',
            'progress' => 'nullable|integer|min:0|max:100',
            'favorite' => 'nullable|boolean',
            'cover_image' => 'nullable',
            'source_link' => 'nullable|string|max:1000',
            'upload_link' => 'nullable|string|max:1000',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('dances', 'public');
            $validated['cover_image'] = $path;
        }

        $dance = Dance::create($validated);

        return response()->json($dance, 201);
    }

    public function update(Request $request, Dance $dance): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'artist' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'difficulty' => 'sometimes|required|string|max:255',
            'status' => 'nullable|string|max:255',
            'progress' => 'nullable|integer|min:0|max:100',
            'favorite' => 'nullable|boolean',
            'cover_image' => 'nullable',
            'source_link' => 'nullable|string|max:1000',
            'upload_link' => 'nullable|string|max:1000',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('dances', 'public');
            $validated['cover_image'] = $path;
        }

        $dance->update($validated);

        return response()->json($dance);
    }

    public function destroy(Dance $dance): JsonResponse
    {
        $dance->delete();

        return response()->json(null, 204);
    }
}
