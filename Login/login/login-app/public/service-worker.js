const CACHE_NAME = 'dorunning-cache-v2'; // 버전 업데이트로 오래된 캐시 삭제
const STATIC_ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 설치 (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 (Activate) - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// 요청 가로채기 (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 정적 자산 (이미지, 아이콘 등)만 캐싱
  if (request.destination === 'image' || url.pathname.includes('/icon-')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // 응답이 성공적이면 캐시에 저장
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // JavaScript, CSS 등은 네트워크 우선 전략 사용
  // 해시가 변경된 새 파일을 항상 가져오도록 함
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.url.endsWith('.js') ||
      request.url.endsWith('.css') ||
      request.url.includes('/assets/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 네트워크 요청 성공
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시에만 캐시 확인 (fallback)
          return caches.match(request);
        })
    );
    return;
  }

  // HTML 파일은 네트워크 우선, 실패 시 캐시
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 네트워크에서 최신 HTML 가져오기
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시에만 캐시된 index.html 반환
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 기타 요청은 네트워크 우선
  event.respondWith(fetch(request));
});
