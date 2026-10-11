import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CanonicalTag = () => {
  const location = useLocation();
  // 트레일링 슬래시 제거 (루트 제외)하여 항상 통일된 정규 URL 보장
  const cleanPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://dorunning.vercel.app${cleanPath}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
};

export default CanonicalTag;
