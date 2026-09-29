import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../pages/IndexPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: IndexPage },
    { path: '/dances', component: IndexPage },
    { path: '/dances/:id', component: IndexPage },
    { path: '/discover', component: IndexPage },
    { path: '/favorites', component: IndexPage }
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

export default router
