import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    //프록시 설정
    proxy: { 
      '/api': {
        target: 'http://localhost:8080', // 백엔드 서버 주소
        changeOrigin: true, // 호스트 헤더를 대상 URL로 변경
        secure  : false, // HTTPS를 사용하는 경우 true로 설정
        rewrite: (path) => path.replace(/^\/api/, '') // /api 경로 제거
      }
    }
      }
})
