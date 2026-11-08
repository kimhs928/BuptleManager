import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 백엔드(./gradlew :app:bootRun)로 API 요청을 넘긴다
    proxy: { '/api': 'http://localhost:8080' },
  },
})
