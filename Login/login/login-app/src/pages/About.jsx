import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import runningImg from '../assets/img/aboutrunning.jpg';
import "../assets/css/info.css";
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Activity, 
  Users, 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  ChevronRight, 
  Trophy,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="info-page">
      <Helmet>
        <title>두러닝 소개 (About) | 전국 마라톤 대회 일정 및 러닝 커뮤니티</title>
        <meta 
          name="description" 
          content="두러닝(Dorunning)은 전국 마라톤 대회 일정 정보, 코스 분석, 실시간 접수 D-Day, 그리고 러너들의 생생한 후기를 하나로 연결하는 러너 중심 플랫폼입니다." 
        />
        <meta property="og:title" content="두러닝 소개 (About) – 모든 러너의 한 걸음이 시작되는 곳" />
        <meta property="og:description" content="전국 마라톤 대회 일정부터 코스 분석, 페이스 계산, 커뮤니티까지 함께 달립니다." />
        <meta property="og:image" content="https://dorunning.vercel.app/og-image.png" />
        <link rel="canonical" href="https://dorunning.vercel.app/about" />
      </Helmet>

      {/* 1. Hero Header */}
      <motion.header 
        className="info-header"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="info-badge">
          <Sparkles size={15} /> ABOUT DORUNNING
        </div>
        <h1>
          모든 러너의 완주를 위해,<br />
          <span className="highlight">두러닝(Dorunning)</span>이 함께 달립니다
        </h1>
        <p>
          흩어져 있던 전국 마라톤 대회 일정부터 코스 고도 분석, 페이스 준비, 그리고 러너들의 생생한 후기까지 — 
          달리기를 사랑하는 모든 이들을 위한 프리미엄 러닝 플랫폼입니다.
        </p>
      </motion.header>

      {/* 2. Stat Numbers Grid */}
      <motion.div 
        className="stat-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">240+</div>
          <div className="stat-label">전국 마라톤 대회 데이터</div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">100%</div>
          <div className="stat-label">매주 정기 일정 업데이트</div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">FREE</div>
          <div className="stat-label">러너를 위한 무료 개방 서비스</div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">ALL-IN-1</div>
          <div className="stat-label">일정 · 코스 · 페이스 · 커뮤니티</div>
        </motion.div>
      </motion.div>

      {/* 3. Our Story Section */}
      <motion.div 
        className="info-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="story-grid">
          <div>
            <div className="section-title-wrap">
              <div className="section-icon-box">
                <Trophy size={22} />
              </div>
              <h2>왜 두러닝을 시작했을까요?</h2>
            </div>
            <p className="info-text">
              *"이번 주말 접수 마감인 마라톤 대회가 어디였지?"*, *"코스에 언덕이 많을까?"*<br /><br />
              러너라면 누구나 인터넷 카페, 블로그, 주최사 홈페이지를 일일이 뒤적이며 
              대회 정보를 찾느라 피로를 느꼈던 경험이 있습니다. 접수 개시 5분 만에 마감되는 
              인기 대회 일정을 놓치고 후회했던 순간도 많았습니다.
            </p>
            <div className="info-highlight">
              두러닝은 <strong>"러너가 오직 달리는 기쁨에만 집중할 수 있도록 하자"</strong>는 
              단순하지만 확고한 질문에서 출발했습니다.
            </div>
            <p className="info-text" style={{ marginBottom: 0 }}>
              전국의 로드 레이스부터 트레일 러닝까지 전국의 모든 대회를 가장 빠르고 
              정확하게 안내하며, 참가 전 알아야 할 실전 코스 정보와 러너들의 솔직한 
              경험담을 한곳에 모았습니다.
            </p>
          </div>

          <div className="story-img-container">
            <img src={runningImg} alt="트랙 위를 힘차게 달리는 두러닝 러너들" className="story-img" />
            <div className="story-float-badge">
              <Zap size={18} color="#38bdf8" />
              <span>함께 달릴 때 우리는 더 멀리, 더 오래 달릴 수 있습니다.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Core Pillars (핵심 기능) */}
      <motion.div 
        className="info-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="section-title-wrap">
          <div className="section-icon-box">
            <Sparkles size={22} />
          </div>
          <h2>두러닝이 제공하는 4대 핵심 서비스</h2>
        </div>
        <p className="info-text">
          목표 대회를 고르고 완주 메달을 목에 걸 때까지 필요한 모든 과정을 지원합니다.
        </p>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Calendar size={22} />
              </div>
              <h3 className="pillar-title">1. 전국 마라톤 대회 일정 허브</h3>
            </div>
            <p className="pillar-desc">
              서울, 부산, 제주 등 전국 시·도별 대회와 풀코스, 하프, 10km, 5km 등 종목별 필터링을 지원합니다. 
              접수 시작/마감 D-Day 알림으로 놓치기 쉬운 신청 일정을 지켜드립니다.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <MapPin size={22} />
              </div>
              <h3 className="pillar-title">2. 추천 러닝 코스 & 맵</h3>
            </div>
            <p className="pillar-desc">
              전국 곳곳의 아름다운 러닝 스팟과 대회 코스를 지도와 함께 확인하세요. 
              거리, 주변 편의시설, 노면 상태 등 러너의 눈높이에서 검증된 코스 정보를 제공합니다.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Activity size={22} />
              </div>
              <h3 className="pillar-title">3. 페이스 & 퍼포먼스 계산기</h3>
            </div>
            <p className="pillar-desc">
              목표 완주 시간을 달성하기 위한 1km당 타깃 페이스와 소모 칼로리를 즉시 산출합니다. 
              구간별 랩 타임을 미리 시뮬레이션하여 체계적인 레이스 플랜을 세워보세요.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Users size={22} />
              </div>
              <h3 className="pillar-title">4. 러너 커뮤니티 & 실전 후기</h3>
            </div>
            <p className="pillar-desc">
              물품보관소 대기 시간, 언덕 주로 팁, 급수대 위치 등 주최측 안내문에서는 
              찾기 힘든 실제 참가자들의 생생한 꿀팁과 완주 감동을 나눌 수 있습니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5. Runner-First Principles (두러닝의 약속) */}
      <motion.div 
        className="info-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="section-title-wrap">
          <div className="section-icon-box">
            <ShieldCheck size={22} />
          </div>
          <h2>두러닝의 3가지 원칙 (Our Principles)</h2>
        </div>

        <div className="principles-grid">
          <div className="principle-card">
            <div className="principle-icon">
              <ShieldCheck size={24} />
            </div>
            <h4 className="principle-title">정확하고 정제된 정보</h4>
            <p className="principle-desc">
              공식 요강을 바탕으로 매주 직접 데이터를 교차 검증하여 러너에게 신뢰할 수 있는 정보만을 전달합니다.
            </p>
          </div>

          <div className="principle-card">
            <div className="principle-icon">
              <Zap size={24} />
            </div>
            <h4 className="principle-title">빠르고 군더더기 없는 UI</h4>
            <p className="principle-desc">
              과도한 광고나 불필요한 절차 없이, 러너가 원하는 대회와 정보를 3초 안에 찾을 수 있도록 경량 설계되었습니다.
            </p>
          </div>

          <div className="principle-card">
            <div className="principle-icon">
              <HeartHandshake size={24} />
            </div>
            <h4 className="principle-title">러너와 함께 성장</h4>
            <p className="principle-desc">
              러너들의 소중한 피드백을 적극 경청하며, 커뮤니티의 목소리를 실제 서비스 개선에 매주 즉각 반영합니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 6. Quick Action Navigation */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="section-title-wrap" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <h2>지금 두러닝과 함께 달려보세요</h2>
        </div>

        <div className="cta-strip">
          <Link to="/marathon" className="cta-card">
            <div className="cta-info">
              <Calendar size={20} color="var(--primary)" />
              <span>전국 마라톤 일정 보기</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/course" className="cta-card">
            <div className="cta-info">
              <MapPin size={20} color="var(--primary)" />
              <span>추천 러닝 코스 탐색</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/performance" className="cta-card">
            <div className="cta-info">
              <Activity size={20} color="var(--primary)" />
              <span>러닝 페이스 계산기</span>
            </div>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
            서비스 개선 제안이나 협업 문의는 언제든 열려 있습니다.
          </p>
          <Link 
            to="/contact" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              borderRadius: '9999px',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 8px 20px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.3)',
              transition: 'all 0.2s'
            }}
          >
            문의 및 제안 보내기 <ChevronRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
