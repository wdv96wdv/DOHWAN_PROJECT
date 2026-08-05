import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@ckeditor')) {
              return 'vendor-ckeditor';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('@supabase') || id.includes('firebase')) {
              return 'vendor-db-sdk';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            return 'vendor';
          }
        }
      }
    }
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
