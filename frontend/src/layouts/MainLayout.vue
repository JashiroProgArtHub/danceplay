<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img src="/logo.svg" alt="DancePlay Logo" @error="$event.target.src='https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg'">
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout'
})
</script>
