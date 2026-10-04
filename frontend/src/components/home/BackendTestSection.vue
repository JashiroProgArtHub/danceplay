<template>
  <section class="content-section q-mt-xl">
    <div class="section-heading">
      <div>
        <span class="eyebrow">API INTEGRATION</span>
        <h2>Backend Connection</h2>
      </div>
    </div>

    <div class="backend-test-card">
      <p class="test-description">
        Click the button below to test the connection between the Vue/Quasar frontend and Laravel API.
      </p>

      <div class="test-controls">
        <q-btn
          color="primary"
          label="Test Backend"
          :loading="isLoading"
          no-caps
          class="test-btn"
          @click="testApi"
        />
      </div>

      <div v-if="message" class="result-box success-box">
        <q-icon name="check_circle" color="positive" size="20px" />
        <span>{{ message }}</span>
      </div>

      <div v-else-if="errorMessage" class="result-box error-box">
        <q-icon name="error" color="negative" size="20px" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const message = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function testApi() {
  isLoading.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const response = await axios.get<{ message: string }>('/api/hello')
    message.value = response.data.message
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      errorMessage.value = `Error: Server responded with status ${error.response.status}`
    } else {
      errorMessage.value = 'Failed to connect to Laravel backend. Please make sure the server is running.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.backend-test-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

.test-description {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 18px;
  line-height: 1.5;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 10px;
}

.result-box {
  margin-top: 18px;
  padding: 14px 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
}

.success-box {
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.error-box {
  background: rgba(231, 76, 60, 0.12);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}
</style>
