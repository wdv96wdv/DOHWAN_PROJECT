import React from 'react';
import { Helmet } from 'react-helmet-async';
import runningImg from '../assets/img/aboutrunning.jpg';
import "../assets/css/info.css";
import "../assets/css/auth.css";
import { Info, Target, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="info-page">
      <Helmet>
        <title>두러닝 소개 | 두러닝</title>
        <meta name="description" content="두러닝은 전국 마라톤·러닝 대회 일정을 모으고, 신청 전에 필요한 정보를 한곳에서 확인하게 해 주는 러닝 허브입니다." />
        <meta property="og:title" content="두러닝 – 전국 마라톤 대회 일정" />
        <meta property="og:description" content="서울부터 지방까지, 다가오는 러닝 대회 일정과 접수 정보를 모았습니다." />
        <link rel="canonical" href="https://dorunning.vercel.app/about" />
      </Helmet>
      <header className="info-header">
        <h1>두러닝 <span style={{ color: 'var(--primary)' }}>소개</span></h1>
        <p>두러닝은 전국 마라톤·러닝 대회 일정을 모으고, 신청 전에 필요한 정보를 한곳에서 확인하게 해 주는 러닝 허브입니다.</p>
      </header>

      <div className="info-section">
        <h2><Info size={24} /> 미션</h2>
        <p className="info-text">
          두러닝은 러너가 다음 대회를 고르고 신청 준비를 끝낼 수 있게, 일정과 코스·커뮤니티를 이어 주는 서비스입니다. 기록·챌린지는 그다음 단계입니다.
        </p>
        <div className="info-highlight">
          전국 대회 일정을 모으고, 신청 전에 필요한 정보를 한곳에서 확인하세요.
        </div>
        <img src={runningImg} alt="Runners on track" className="info-image" />
      </div>

      <div className="info-section">
        <h2><Target size={24} /> 핵심 기능</h2>
        <ul className="info-list">
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Smart Route Discovery:</strong> Explore curated courses optimized for your skill level.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Event Integration:</strong> Stay updated with global and local marathons and community runs.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Personalized Analytics:</strong> Visualize your progress with advanced performance tracking tools.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Premium Experience:</strong> Enjoy a focus-driven interface designed for the modern runner.</span>
          </li>
        </ul>
      </div>

      <div className="info-section" style={{ textAlign: 'center' }}>
        <h2><MessageCircle size={24} style={{ margin: '0 auto' }} /> 문의하기</h2>
        <p className="info-text">궁금한 점이나 제안이 있으신가요? 언제든 메시지를 남겨 주세요.</p>
        <a href="/contact" className="btn-auth" style={{ display: 'inline-flex', padding: '12px 32px', marginTop: '16px' }}>
          문의하기 <ChevronRight size={18} style={{ marginLeft: '8px' }} />
        </a>
      </div>
    </div>
  );
};

export default About;
