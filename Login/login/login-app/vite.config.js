import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    // 프록시 설정
    proxy: {
      // '/api/naver-shopping' 요청은 Vercel 개발 서버로 프록시
      '/api/naver-shopping': {
        target: 'http://localhost:3000', // Vercel 개발 서버 주소
        changeOrigin: true,
        secure: false,
        // 이 경로는 재작성(rewrite)하지 않음
      },
      // 나머지 '/api' 요청은 기존 Spring Boot 서버로 프록시
      '/api' : {
        target: 'http://localhost:8080', // (port) 서버 주소
        changeOrigin: true,              // 요청헤더의 Host 도 변경
        secure: false,                   // https 지원 여부
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
