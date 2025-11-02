import React, { useEffect } from 'react';

/**
 * Google AdSense 광고 컴포넌트
 * 
 * 사용법:
 * <AdSense 
 *   adSlot="1234567890"  // AdSense 광고 슬롯 ID (선택사항)
 *   adFormat="auto"       // 광고 형식: auto, rectangle, horizontal 등
 *   fullWidthResponsive   // 반응형 전체 너비 (기본값: true)
 * />
 */
const AdSense = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  useEffect(() => {
    try {
      // AdSense 스크립트 로드 후 광고 초기화
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        // 이미 로드된 경우 즉시 push
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        // 스크립트가 아직 로드되지 않은 경우 대기
        const checkAdSense = setInterval(() => {
          if (window.adsbygoogle && window.adsbygoogle.loaded) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdSense);
          }
        }, 100);
        
        // 5초 후에도 로드되지 않으면 정리
        setTimeout(() => clearInterval(checkAdSense), 5000);
      }
    } catch (err) {
      console.error('AdSense 광고 로드 실패:', err);
    }
  }, []);

  const adProps = {
    className: `adsbygoogle ${className}`,
    style: {
      display: 'block',
      textAlign: 'center',
      ...style
    },
    'data-ad-client': 'ca-pub-2101342005753548',
    'data-ad-slot': adSlot || undefined,
    'data-ad-format': adFormat,
    'data-full-width-responsive': fullWidthResponsive ? 'true' : undefined,
  };

  // adSlot이 없으면 기본 광고 형식 사용
  if (!adSlot) {
    return (
      <ins
        {...adProps}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  return <ins {...adProps} />;
};

export default AdSense;

