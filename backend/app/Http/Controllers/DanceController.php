<?php

namespace App\Http\Controllers;

use App\Models\Dance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests\StoreDanceRequest;
use App\Http\Requests\UpdateDanceRequest;

class DanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Dance::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('artist', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(12));
    }

    public function trending(): JsonResponse
    {
        $dances = Dance::query()
            ->orderBy('favorite', 'desc')
            ->orderBy('progress', 'desc')
            ->orderBy('id', 'asc')
            ->take(5)
            ->get()
            ->values()
            ->map(function ($dance, $index) {
                $dance->rank = $index + 1;
                return $dance;
            });

        return response()->json($dances);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Dance::count(),
            'learning' => Dance::where('status', 'Learning')->count(),
            'ready' => Dance::where('status', 'Ready to Film')->count(),
            'uploaded' => Dance::where('status', 'Uploaded')->count(),
            'want_to_learn' => Dance::where('status', 'Want to Learn')->count(),
            'favorites' => Dance::where('favorite', true)->count(),
        ]);
    }

    public function store(StoreDanceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $path;
        } elseif ($request->exists('cover_image')) {
            $rawCover = $request->input('cover_image');
            $validated['cover_image'] = !empty($rawCover) ? $rawCover : null;
        }

        $dance = Dance::create($validated);
        return response()->json($dance, 201);
    }

    public function update(UpdateDanceRequest $request, Dance $dance): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            // Delete old disk file if exists
            if ($dance->cover_image && str_starts_with($dance->cover_image, '/storage/covers/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $dance->cover_image));
            }
            
            $path = $request->file('cover_image')->store('covers', 'public');
            $validated['cover_image'] = '/storage/' . $path;
        } elseif ($request->exists('cover_image')) {
            $newCover = $request->input('cover_image');
            if (empty($newCover) && $dance->cover_image && str_starts_with($dance->cover_image, '/storage/covers/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $dance->cover_image));
            }
            $validated['cover_image'] = !empty($newCover) ? $newCover : null;
        }

        $dance->update($validated);
        return response()->json($dance, 200);
    }

    public function destroy(Dance $dance): JsonResponse
    {
        $dance->delete();

        return response()->json(null, 204);
    }

    public function restore($id): JsonResponse
    {
        $dance = Dance::onlyTrashed()->findOrFail($id);
        $dance->restore();

        return response()->json($dance, 200);
    }
}
