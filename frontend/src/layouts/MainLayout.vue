<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img
            src="/logo.svg"
            alt="DancePlay Logo"
            @error="handleLogoError"
          >
        </q-avatar>
        <q-toolbar-title>
          DANCEPLAY
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
function handleLogoError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg'
  }
}
</script>
