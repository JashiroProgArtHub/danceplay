import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'quasar/src/css/index.sass'
import './css/app.scss'

createApp(App)
  .use(Quasar, { plugins: {} })
  .use(createPinia())
  .use(router)
  .mount('#q-app')
