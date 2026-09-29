import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => ({
  boot: [],
  css: ['app.scss'],
  extras: ['material-icons'],
  build: {
    target: {
      browser: ['es2022', 'firefox115', 'chrome115', 'safari15']
    },
    typescript: {
      strict: true,
      vueShim: true
    },
    vueRouterMode: 'history'
  },
  devServer: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  framework: {
    config: {},
    plugins: ['Notify']
  }
}))
