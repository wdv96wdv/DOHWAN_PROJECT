# 배포 후 MIME Type 오류 해결 가이드

## 🔍 문제 원인

배포 후 시간이 지나면 발생하는 `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"` 오류의 주요 원인:

1. **Service Worker 캐싱 문제**: Service Worker가 JavaScript 파일을 캐싱하여 새로 빌드된 파일(해시가 다른)을 가져오지 못함
2. **SPA 라우팅 문제**: 서버가 JavaScript 파일 경로를 HTML로 리다이렉트
3. **캐시 전략 문제**: 오래된 파일이 브라우저에 캐싱되어 새 파일을 가져오지 못함

## ✅ 적용된 해결 방법

### 1. Service Worker 개선 (`public/service-worker.js`)

**변경사항:**
- ✅ JavaScript/CSS 파일은 **네트워크 우선 전략** 사용
- ✅ 해시가 변경된 새 파일을 항상 서버에서 가져오도록 수정
- ✅ 정적 자산(이미지, 아이콘)만 캐싱
- ✅ 캐시 버전 업데이트 (v1 → v2)로 오래된 캐시 자동 삭제

**주요 로직:**
```javascript
// JavaScript, CSS는 네트워크에서 먼저 가져오기
if (request.destination === 'script' || request.url.endsWith('.js')) {
  event.respondWith(
    fetch(request)  // 네트워크 우선
      .catch(() => caches.match(request))  // 실패 시에만 캐시
  );
}
```

### 2. Vercel 설정 개선 (`vercel.json`)

**변경사항:**
- ✅ SPA 라우팅을 위한 rewrite 규칙 명확화
- ✅ `index.html`은 항상 최신 버전 가져오도록 캐시 설정
- ✅ 자산 파일은 장기 캐싱 (해시가 포함되어 안전)

### 3. Service Worker 등록 개선 (`src/main.jsx`)

**변경사항:**
- ✅ `updateViaCache: 'none'` 옵션 추가로 즉시 업데이트
- ✅ 서비스 워커 업데이트 시 자동 새로고침
- ✅ 새 버전 감지 시 자동 리로드

## 📋 추가 확인사항

### 1. 빌드 확인

배포 전 빌드가 정상적으로 완료되었는지 확인:
```bash
npm run build
```

빌드 후 `dist` 폴더에 다음이 생성되는지 확인:
- `index.html` (해시가 포함된 JS/CSS 파일 참조)
- `assets/` 폴더 내 해시가 포함된 파일들

### 2. 배포 후 테스트

1. **브라우저 개발자 도구 확인**
   - Network 탭에서 JS 파일이 올바른 MIME type으로 로드되는지 확인
   - Console에서 Service Worker 관련 오류 확인

2. **캐시 클리어**
   ```javascript
   // 브라우저 콘솔에서 실행
   caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
   navigator.serviceWorker.getRegistrations().then(regs => 
     regs.forEach(reg => reg.unregister())
   );
   ```

3. **강력 새로고침**
   - Windows: `Ctrl + Shift + R` 또는 `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### 3. 문제가 계속되는 경우

**임시 해결 방법 (Service Worker 비활성화):**

```javascript
// src/main.jsx에서 Service Worker 등록 부분 주석 처리
// if ('serviceWorker' in navigator) {
//   ...
// }
```

**완전 해결 (Service Worker 제거):**

1. `public/service-worker.js` 삭제 또는 빈 파일로 변경
2. `src/main.jsx`에서 Service Worker 등록 코드 제거
3. `manifest.json` 확인 (필요시 수정)

## 🔄 배포 워크플로우

1. **로컬 테스트**
   ```bash
   npm run build
   npm run preview  # 또는 npx serve dist
   ```

2. **빌드 확인**
   - `dist/index.html` 파일에서 올바른 JS 파일 경로 확인
   - 해시가 포함된 파일명인지 확인

3. **배포**
   ```bash
   # Vercel
   vercel --prod
   
   # 또는 Git push (자동 배포)
   git push origin main
   ```

4. **배포 후 확인**
   - 브라우저 개발자 도구 > Application > Service Workers
   - 오래된 Service Worker가 제거되었는지 확인
   - Network 탭에서 JS 파일이 올바르게 로드되는지 확인

## ⚠️ 주의사항

- Service Worker 캐시를 업데이트하려면 **캐시 버전 번호를 변경**해야 함
- 배포 후 사용자들이 즉시 새 버전을 받지 못할 수 있음 (Service Worker 업데이트 시간 필요)
- 중요한 업데이트의 경우 사용자에게 새로고침을 안내하는 메시지 표시 권장

## 📚 참고 자료

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vercel Routing](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Cache Strategies](https://web.dev/service-worker-caching-and-http-caching/)

