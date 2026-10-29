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
        <title>러닝 가이드 & 마라톤 훈련 팁 매거진 | 두러닝</title>
        <meta
          name="description"
          content="런린이 10K 완주 훈련 플랜, 러닝화 추천 가이드, 마라톤 카보로딩 식단, 에너지젤 섭취법, 부상 예방까지 러너를 위한 전문 정보를 만나보세요."
        />
        <meta property="og:title" content="러닝 가이드 & 마라톤 훈련 팁 매거진 | 두러닝" />
        <meta property="og:description" content="완주를 꿈꾸는 모든 러너를 위한 체계적인 마라톤 훈련과 기어 가이드." />
        <link rel="canonical" href="https://dorunning.app/guide" />
      </Helmet>

      <header className="guide-header">
        <div className="guide-badge">
          <BookOpen size={15} /> RUNNING MAGAZINE & GUIDE
        </div>
        <h1 className="guide-title">러너를 위한 실전 완주 가이드</h1>
        <p className="guide-subtitle">
          첫 10km 완주부터 풀코스 서브4 도전까지, 마라톤 코치와 에디터가 검증한 실전 훈련법, 영양 보급, 장비 선택 팁을 제공합니다.
        </p>
      </header>

      {/* Category Nav */}
      <nav className="guide-category-nav" aria-label="가이드 카테고리">
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
                가이드 읽기 <ChevronRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GuideList;

