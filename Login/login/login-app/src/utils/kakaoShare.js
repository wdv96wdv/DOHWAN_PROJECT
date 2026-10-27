/**
 * 카카오톡 공유 (Kakao.Share) 유틸리티
 * Kakao JavaScript SDK를 동기/비동기로 초기화하고 리치 피드 카드를 공유합니다.
 */

const KAKAO_JS_KEY = '6596ccd29e4ca043d50a362864c260c9';

/**
 * Kakao SDK를 올바른 JavaScript 키로 확실하게 초기화합니다.
 * 이미 다른 키로 초기화되어 있을 경우 cleanup 후 재초기화합니다.
 */
const ensureKakaoInit = () => {
    if (typeof window === 'undefined' || !window.Kakao) return false;

    try {
        // 이미 초기화되어 있다면 cleanup 후 재초기화
        if (window.Kakao.isInitialized()) {
            window.Kakao.cleanup();
        }
        window.Kakao.init(KAKAO_JS_KEY);
        console.log('[Kakao] initialized with key:', KAKAO_JS_KEY);
        console.log('[Kakao] isInitialized:', window.Kakao.isInitialized());
        return true;
    } catch (e) {
        console.error('[Kakao] init failed:', e);
        return false;
    }
};

/**
 * Kakao SDK 스크립트를 로드하고 초기화합니다.
 */
const loadKakaoSdk = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('No window'));

        // SDK가 이미 로드되어 있으면 초기화만 수행
        if (window.Kakao) {
            ensureKakaoInit();
            return resolve(window.Kakao);
        }

        // 이미 로딩 중인 스크립트가 있는지 확인
        const existingScript = document.querySelector('script[src*="kakao_js_sdk"]');
        if (existingScript) {
            if (window.Kakao) {
                ensureKakaoInit();
                return resolve(window.Kakao);
            }
            existingScript.addEventListener('load', () => {
                ensureKakaoInit();
                resolve(window.Kakao);
            });
            return;
        }

        // 새로 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            ensureKakaoInit();
            resolve(window.Kakao);
        };
        script.onerror = (err) => {
            console.error('[Kakao] Failed to load SDK:', err);
            reject(err);
        };
        document.head.appendChild(script);
    });
};

/**
 * 마라톤 상세 정보 카카오톡 리치 피드 공유
 * PC 브라우저: 카카오 계정 로그인 / QR코드 대화방 전송 팝업창
 * 모바일 브라우저: 스마트폰 카카오톡 앱 즉시 실행
 */
export const shareKakaoMarathon = async ({
    title,
    raceDate,
    location,
    types,
    dDay,
    posterUrl,
    pageUrl
}) => {
    try {
        // SDK 로드 및 초기화 보장
        await loadKakaoSdk();

        // 공유 직전에 한 번 더 확실하게 초기화
        ensureKakaoInit();

        if (!window.Kakao || !window.Kakao.Share) {
            throw new Error('Kakao Share API is not available.');
        }

        console.log('[Kakao] Share - isInitialized:', window.Kakao.isInitialized());

        const targetUrl = pageUrl || window.location.href;
        const imageUrl = posterUrl && posterUrl.startsWith('http')
            ? posterUrl
            : 'https://www.dorunning.app/og-image.png';

        const typesText = Array.isArray(types) ? types.join(', ') : (types || '마라톤');
        const descLines = [];
        if (raceDate) descLines.push(`📅 일시: ${raceDate}`);
        if (location) descLines.push(`📍 장소: ${location}`);
        if (typesText) descLines.push(`🏃 종목: ${typesText}`);
        if (dDay) descLines.push(`⏳ ${dDay}`);

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `[두러닝] ${title}`,
                description: descLines.join('\n'),
                imageUrl: imageUrl,
                link: {
                    mobileWebUrl: targetUrl,
                    webUrl: targetUrl,
                },
            },
            buttons: [
                {
                    title: '대회 상세 & 접수 보기',
                    link: {
                        mobileWebUrl: targetUrl,
                        webUrl: targetUrl,
                    },
                },
                {
                    title: '전국 마라톤 일정 보기',
                    link: {
                        mobileWebUrl: 'https://www.dorunning.app/marathon',
                        webUrl: 'https://www.dorunning.app/marathon',
                    },
                },
            ],
        });
        return { success: true };
    } catch (err) {
        console.error('[Kakao] share error:', err);
        return { success: false, error: err };
    }
};
