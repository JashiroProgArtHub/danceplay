<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="api-demo-modal">
      <button type="button" class="close-btn" @click="emit('update:modelValue', false)" aria-label="Close modal">×</button>
      <span class="eyebrow">API CONNECTION</span>
      <h2>Backend Test</h2>
      <p class="api-intro">Test the connection between Vue/Quasar and Laravel API (<code>/api/hello</code>).</p>

      <div class="api-demo-body">
        <div class="api-demo-copy">
          <div>
            <strong>Laravel API Test</strong>
            <p>Send an Axios request to the backend.</p>
          </div>
          <q-btn
            unelevated
            no-caps
            color="primary"
            class="api-test-btn"
            :loading="backendLoading"
            label="Test Backend"
            @click="testApi"
          />
        </div>

        <div v-if="backendMessage" class="api-message">
          <q-icon name="check_circle" color="positive" size="18px" class="q-mr-xs" />
          <span>{{ backendMessage }}</span>
        </div>
        <div v-else-if="backendError" class="api-error">
          <q-icon name="error" color="negative" size="18px" class="q-mr-xs" />
          <span>{{ backendError }}</span>
        </div>
      </div>

      <div class="api-modal-actions">
        <button class="secondary-btn" @click="emit('update:modelValue', false)">Close</button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const backendLoading = ref(false)
const backendMessage = ref('')
const backendError = ref('')

async function testApi() {
  backendLoading.value = true
  backendError.value = ''
  try {
    const response = await axios.get<{ message: string }>('/api/hello')
    backendMessage.value = response.data.message
  } catch (error) {
    backendMessage.value = ''
    backendError.value =
      axios.isAxiosError(error) && error.response
        ? `Backend returned HTTP ${error.response.status}.`
        : 'Could not connect to Laravel backend. Make sure the server is running.'
  } finally {
    backendLoading.value = false
  }
}
</script>

<style scoped>
.api-demo-modal {
  width: min(500px, 92vw);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 26px;
  position: relative;
  color: var(--text);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.api-demo-modal h2 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.api-intro {
  color: var(--muted);
  margin: 0 0 18px;
  font-size: 13px;
}
.api-demo-body {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.api-demo-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.api-demo-copy strong {
  display: block;
  font-size: 14px;
}
.api-demo-copy p {
  color: var(--muted);
  margin: 4px 0 0;
  font-size: 12px;
}
.api-test-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 16px;
}
.api-message,
.api-error {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
}
.api-message {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.25);
}
.api-error {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.25);
}
.api-modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
@media (max-width: 600px) {
  .api-demo-copy {
    align-items: stretch;
    flex-direction: column;
  }
  .api-test-btn {
    width: 100%;
  }
}
</style>
