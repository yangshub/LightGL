import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
      '@source': '/source',
      '@views': '/src/views'
    }
  },
  server: {
    port: 8080
  }
})
