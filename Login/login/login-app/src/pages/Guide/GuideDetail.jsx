import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, Tag, ChevronRight, Trophy, BookOpen } from 'lucide-react';
import { GUIDE_ARTICLES } from '../../utils/guideData';
import '../../assets/css/guide.css';

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const article = GUIDE_ARTICLES.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) {
    return (
      <div className="guide-detail-container" style={{ textAlign: 'center', padding: '160px 20px' }}>
        <h2>ê°€?´ë“œë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>
          ?”ì²­?˜ì‹  ê°€?´ë“œê°€ ?? œ?˜ì—ˆê±°ë‚˜ ì¡´ì¬?˜ì? ?ŠìŠµ?ˆë‹¤.
        </p>
        <Link to="/guide" className="guide-detail-back">
          <ArrowLeft size={16} /> ê°€?´ë“œ ëª©ë¡?¼ë¡œ ?Œì•„ê°€ê¸?        </Link>
      </div>
    );
  }

  // ê°„ë‹¨??ë§ˆí¬?¤ìš´ ?¤ë”©/ë¬¸ë‹¨ ?Œë”ë§??¬í¼
  const renderContent = (rawText) => {
    const lines = rawText.trim().split('\n');
    const elements = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`}>
            {currentList.map((li, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(li) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const formatInline = (str) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`h3-${idx}`}>{trimmed.slice(4)}</h3>);
      } else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${idx}`}>{trimmed.slice(3)}</h2>);
      } else if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.slice(2));
      } else {
        flushList();
        elements.push(
          <p key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      }
    });

    flushList();
    return elements;
  };

  const pageUrl = `https://www.dorunning.app/guide/${article.id}`;
  const fullTitle = `${article.title} | ?ëŸ¬???¬ë‹ ê°€?´ë“œ`;

  return (
    <div className="guide-detail-container">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={article.summary} />
        <link rel="canonical" href={pageUrl} />

        {/* Schema.org Article Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.summary,
            "author": {
              "@type": "Organization",
              "name": "?ëŸ¬??Dorunning)",
              "url": "https://www.dorunning.app"
            },
            "publisher": {
              "@type": "Organization",
              "name": "?ëŸ¬??,
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.dorunning.app/og-image.png"
              }
            },
            "datePublished": article.date,
            "dateModified": article.date,
            "mainEntityOfPage": pageUrl
          })}
        </script>

        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      <nav className="guide-detail-nav">
        <Link to="/guide" className="guide-detail-back">
          <ArrowLeft size={16} /> ê°€?´ë“œ ëª©ë¡?¼ë¡œ ?Œì•„ê°€ê¸?        </Link>
      </nav>

      <header className="guide-detail-header">
        <div className="guide-detail-meta">
          <span className="guide-card-cat">{article.categoryName}</span>
          <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {article.date}</span>
          <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> ?½ëŠ” ?œê°„ {article.readTime}</span>
        </div>
        <h1 className="guide-detail-title">{article.title}</h1>
        <div className="guide-detail-lead">{article.summary}</div>
      </header>

      <article className="guide-article-body">
        {renderContent(article.content)}
      </article>

      {/* End of Guide CTA */}
      <section className="guide-end-cta">
        <h3>?´ë²ˆ ì£¼ë§, ë°°ìš´ ?ìœ¼ë¡?ë§ˆë¼???€?Œì— ?„ì „?´ë³´?¸ìš”</h3>
        <p>
          ?„êµ­ 200??ê°?ë§ˆë¼???€?Œì˜ ?¤ì‹œê°??‘ìˆ˜ ?¼ì •ê³?ì½”ìŠ¤ ?•ë³´ë¥??ëŸ¬?ì—???œëˆˆ??ë¹„êµ?˜ê³  ? ì²­?????ˆìŠµ?ˆë‹¤.
        </p>
        <Link to="/marathon" className="guide-cta-btn">
          <Trophy size={18} /> ?¤ê??¤ëŠ” ?„êµ­ ë§ˆë¼???¼ì • ë³´ê¸°
        </Link>
      </section>
    </div>
  );
};

export default GuideDetail;

