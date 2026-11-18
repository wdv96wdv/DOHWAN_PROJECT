import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, ChevronRight, Sparkles, Compass } from 'lucide-react';
import { GUIDE_ARTICLES, GUIDE_CATEGORIES } from '../../utils/guideData';
import '../../assets/css/guide.css';

const GuideList = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = selectedCategory === 'all'
    ? GUIDE_ARTICLES
    : GUIDE_ARTICLES.filter(item => item.category === selectedCategory);

  return (
    <div className="guide-page">
      <Helmet>
        <title>?¬ë‹ ê°€?´ë“œ & ë§ˆë¼???ˆë ¨ ??ë§¤ê±°ì§?| ?ëŸ¬??/title>
        <meta
          name="description"
          content="?°ë¦°??10K ?„ì£¼ ?ˆë ¨ ?Œëœ, ?¬ë‹??ì¶”ì²œ ê°€?´ë“œ, ë§ˆë¼??ì¹´ë³´ë¡œë”© ?ë‹¨, ?ë„ˆì§€????·¨ë²? ë¶€???ˆë°©ê¹Œì? ?¬ë„ˆë¥??„í•œ ?„ë¬¸ ?•ë³´ë¥?ë§Œë‚˜ë³´ì„¸??"
        />
        <meta property="og:title" content="?¬ë‹ ê°€?´ë“œ & ë§ˆë¼???ˆë ¨ ??ë§¤ê±°ì§?| ?ëŸ¬?? />
        <meta property="og:description" content="?„ì£¼ë¥?ê¿ˆê¾¸??ëª¨ë“  ?¬ë„ˆë¥??„í•œ ì²´ê³„?ì¸ ë§ˆë¼???ˆë ¨ê³?ê¸°ì–´ ê°€?´ë“œ." />
        <link rel="canonical" href="https://www.dorunning.app/guide" />
      </Helmet>

      <header className="guide-header">
        <div className="guide-badge">
          <BookOpen size={15} /> RUNNING MAGAZINE & GUIDE
        </div>
        <h1 className="guide-title">?¬ë„ˆë¥??„í•œ ?¤ì „ ?„ì£¼ ê°€?´ë“œ</h1>
        <p className="guide-subtitle">
          ì²?10km ?„ì£¼ë¶€???€ì½”ìŠ¤ ?œë¸Œ4 ?„ì „ê¹Œì?, ë§ˆë¼??ì½”ì¹˜?€ ?ë””?°ê? ê²€ì¦í•œ ?¤ì „ ?ˆë ¨ë²? ?ì–‘ ë³´ê¸‰, ?¥ë¹„ ? íƒ ?ì„ ?œê³µ?©ë‹ˆ??
        </p>
      </header>

      {/* Category Nav */}
      <nav className="guide-category-nav" aria-label="ê°€?´ë“œ ì¹´í…Œê³ ë¦¬">
        {GUIDE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`guide-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Articles Grid */}
      <div className="guide-grid">
        {filteredArticles.map(article => (
          <Link key={article.id} to={`/guide/${article.id}`} className="guide-card">
            <div className="guide-card-top">
              <span className="guide-card-cat">{article.categoryName}</span>
              <span className="guide-card-time">
                <Clock size={14} /> {article.readTime}
              </span>
            </div>
            <h2 className="guide-card-title">{article.title}</h2>
            <p className="guide-card-summary">{article.summary}</p>
            <div className="guide-card-footer">
              <span>{article.date}</span>
              <span className="guide-card-readmore">
                ê°€?´ë“œ ?½ê¸° <ChevronRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GuideList;

