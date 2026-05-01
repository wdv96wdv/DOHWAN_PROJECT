import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    target: 'esnext'
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server:{
    // 프록시 설정
    proxy: {
      // '/api' 요청은 기존 Spring Boot 서버로 프록시
      '/api' : {
        target: 'http://localhost:8080', // (port) 서버 주소
        changeOrigin: true,              // 요청헤더의 Host 도 변경
        secure: false,                   // https 지원 여부
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
