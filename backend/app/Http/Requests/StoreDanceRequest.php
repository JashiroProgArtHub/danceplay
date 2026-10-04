<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merges = [];
        if ($this->has('sourceLink') && !$this->has('source_link')) {
            $merges['source_link'] = $this->input('sourceLink');
        }
        if ($this->has('uploadLink') && !$this->has('upload_link')) {
            $merges['upload_link'] = $this->input('uploadLink');
        }
        if ($this->exists('coverImage') && !$this->exists('cover_image')) {
            $merges['cover_image'] = $this->input('coverImage');
        }

        if (!empty($merges)) {
            $this->merge($merges);
        }
    }

    public function rules(): array
    {
        $coverRules = $this->hasFile('cover_image')
            ? ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048']
            : ['nullable', 'string'];

        return [
            'title' => ['required', 'string', 'max:255'],
            'artist' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'difficulty' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'favorite' => ['sometimes', 'boolean'],
            'source_link' => ['nullable', 'string'],
            'upload_link' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'cover_image' => $coverRules,
        ];
    }
}
