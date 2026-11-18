import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CanonicalTag = () => {
  const location = useLocation();
  // ?¸ë ˆ?¼ë§ ?¬ë˜???œê±° (ë£¨íŠ¸ ?œì™¸)?˜ì—¬ ??ƒ ?µì¼???•ê·œ URL ë³´ì¥
  const cleanPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://www.dorunning.app${cleanPath}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
};

export default CanonicalTag;
