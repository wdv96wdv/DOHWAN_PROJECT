import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// =========================
// 서비스워커 등록 (PWA)
// =========================

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

