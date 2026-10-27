import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// SEO 프리렌더링 블록이 DOM에 존재할 경우 브라우저 렌더링 시 깔끔하게 제거
if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-seo-prerender]').forEach((el) => el.remove());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

// =========================
// 서비스워커 등록 (PWA) - 비활성화됨
// =========================
// 기존에 등록된 서비스 워커를 모두 제거하여 Ctrl+Shift+R 에러 방지
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js', { 
//         // 서비스 워커 업데이트 즉시 활성화
//         updateViaCache: 'none' 
//       })
//       .then((reg) => {
//         console.log('Service Worker registered:', reg);
        
//         // 서비스 워커 업데이트 확인
//         reg.addEventListener('updatefound', () => {
//           const newWorker = reg.installing;
//           if (newWorker) {
//             newWorker.addEventListener('statechange', () => {
//               if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//                 // 새 서비스 워커가 설치되었을 때 페이지 새로고침 권장
//                 console.log('New service worker available. Reload to update.');
//               }
//             });
//           }
//         });
//       })
//       .catch((err) => console.log('Service Worker registration failed:', err))
    
//     // 서비스 워커 업데이트 체크 (주기적으로)
//     let refreshing = false;
//     navigator.serviceWorker.addEventListener('controllerchange', () => {
//       if (!refreshing) {
//         refreshing = true;
//         window.location.reload();
//       }
//     });
//   })
// }

