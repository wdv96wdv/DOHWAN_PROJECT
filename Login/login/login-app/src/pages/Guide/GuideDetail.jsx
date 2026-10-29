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
        <h2>가이드를 찾을 수 없습니다</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>
          요청하신 가이드가 삭제되었거나 존재하지 않습니다.
        </p>
        <Link to="/guide" className="guide-detail-back">
          <ArrowLeft size={16} /> 가이드 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 간단한 마크다운 헤딩/문단 렌더링 헬퍼
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

  const pageUrl = `https://dorunning.app/guide/${article.id}`;
  const fullTitle = `${article.title} | 두러닝 러닝 가이드`;

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
              "name": "두러닝(Dorunning)",
              "url": "https://dorunning.app"
            },
            "publisher": {
              "@type": "Organization",
              "name": "두러닝",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dorunning.app/og-image.png"
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
          <ArrowLeft size={16} /> 가이드 목록으로 돌아가기
        </Link>
      </nav>

      <header className="guide-detail-header">
        <div className="guide-detail-meta">
          <span className="guide-card-cat">{article.categoryName}</span>
          <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {article.date}</span>
          <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 읽는 시간 {article.readTime}</span>
        </div>
        <h1 className="guide-detail-title">{article.title}</h1>
        <div className="guide-detail-lead">{article.summary}</div>
      </header>

      <article className="guide-article-body">
        {renderContent(article.content)}
      </article>

      {/* End of Guide CTA */}
      <section className="guide-end-cta">
        <h3>이번 주말, 배운 팁으로 마라톤 대회에 도전해보세요</h3>
        <p>
          전국 200여 개 마라톤 대회의 실시간 접수 일정과 코스 정보를 두러닝에서 한눈에 비교하고 신청할 수 있습니다.
        </p>
        <Link to="/marathon" className="guide-cta-btn">
          <Trophy size={18} /> 다가오는 전국 마라톤 일정 보기
        </Link>
      </section>
    </div>
  );
};

export default GuideDetail;

