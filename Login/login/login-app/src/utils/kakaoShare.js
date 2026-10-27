/**
 * 카카오톡 공유 (Kakao.Share) 유틸리티
 * Kakao JavaScript SDK를 동기/비동기로 초기화하고 리치 피드 카드를 공유합니다.
 */

export const getKakaoJsKey = () => {
    return (
        import.meta.env.VITE_KAKAO_JS_KEY ||
        import.meta.env.VITE_KAKAO_MAP_CLIENT_ID ||
        '6596ccd29e4ca043d50a362864c260c9'
    );
};

export const initKakao = () => {
    if (typeof window === 'undefined') return;
    if (window.Kakao && !window.Kakao.isInitialized()) {
        try {
            window.Kakao.init(getKakaoJsKey());
        } catch (e) {
            console.warn('Kakao init warning:', e);
        }
    }
};

// 모듈 로드 시 즉시 초기화 시도
if (typeof window !== 'undefined' && window.Kakao) {
    initKakao();
}

export const loadKakaoSdk = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('No window'));

        if (window.Kakao && window.Kakao.isInitialized()) {
            return resolve(window.Kakao);
        }

        if (window.Kakao && !window.Kakao.isInitialized()) {
            initKakao();
            return resolve(window.Kakao);
        }

        const existingScript = document.getElementById('kakao-js-sdk');
        if (existingScript) {
            existingScript.addEventListener('load', () => {
                initKakao();
                resolve(window.Kakao);
            });
            return;
        }

        const script = document.createElement('script');
        script.id = 'kakao-js-sdk';
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
        script.integrity = 'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxm4+XR+RzVCDhJFiPrm';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            initKakao();
            resolve(window.Kakao);
        };
        script.onerror = (err) => {
            console.error('Failed to load Kakao SDK:', err);
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
        // 이미 SDK가 준비되어 있다면 즉시 동기 실행 (팝업 차단 방지)
        if (!window.Kakao || !window.Kakao.isInitialized()) {
            await loadKakaoSdk();
        }

        if (!window.Kakao || !window.Kakao.Share) {
            throw new Error('Kakao Share API is not available.');
        }

        const targetUrl = pageUrl || window.location.href;
        const imageUrl = posterUrl && posterUrl.startsWith('http')
            ? posterUrl
            : 'https://dorunning.app/og-image.png';

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
                        mobileWebUrl: 'https://dorunning.app/marathon',
                        webUrl: 'https://dorunning.app/marathon',
                    },
                },
            ],
        });
        return { success: true };
    } catch (err) {
        console.error('Kakao share error:', err);
        return { success: false, error: err };
    }
};
