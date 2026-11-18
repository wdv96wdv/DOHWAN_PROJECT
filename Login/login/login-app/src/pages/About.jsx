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
        <title>?�러???�개 (About) | ?�국 마라???�???�정 �??�닝 커�??�티</title>
        <meta 
          name="description" 
          content="?�러??Dorunning)?� ?�국 마라???�???�정 ?�보, 코스 분석, ?�시�??�수 D-Day, 그리�??�너?�의 ?�생???�기�??�나�??�결?�는 ?�너 중심 ?�랫?�입?�다." 
        />
        <meta property="og:title" content="?�러???�개 (About) ??모든 ?�너????걸음???�작?�는 �? />
        <meta property="og:description" content="?�국 마라???�???�정부??코스 분석, ?�이??계산, 커�??�티까�? ?�께 ?�립?�다." />
        <meta property="og:image" content="https://www.dorunning.app/og-image.png" />
        <link rel="canonical" href="https://www.dorunning.app/about" />
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
          모든 ?�너???�주�??�해,<br />
          <span className="highlight">?�러??Dorunning)</span>???�께 ?�립?�다
        </h1>
        <p>
          ?�어???�던 ?�국 마라???�???�정부??코스 고도 분석, ?�이??준�? 그리�??�너?�의 ?�생???�기까�? ??
          ?�리기�? ?�랑?�는 모든 ?�들???�한 ?�리미엄 ?�닝 ?�랫?�입?�다.
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
          <div className="stat-label">?�국 마라???�???�이??/div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">100%</div>
          <div className="stat-label">매주 ?�기 ?�정 ?�데?�트</div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">FREE</div>
          <div className="stat-label">?�너�??�한 무료 개방 ?�비??/div>
        </motion.div>
        <motion.div variants={fadeInUp} className="stat-card">
          <div className="stat-num">ALL-IN-1</div>
          <div className="stat-label">?�정 · 코스 · ?�이??· 커�??�티</div>
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
              <h2>???�러?�을 ?�작?�을까요?</h2>
            </div>
            <p className="info-text">
              *"?�번 주말 ?�수 마감??마라???�?��? ?�디?�지?"*, *"코스???�덕??많을�?"*<br /><br />
              ?�너?�면 ?�구???�터??카페, 블로�? 주최???�페?��?�??�일???�적?�며 
              ?�???�보�?찾느???�로�??�꼈??경험???�습?�다. ?�수 개시 5�?만에 마감?�는 
              ?�기 ?�???�정???�치�??�회?�던 ?�간??많았?�니??
            </p>
            <div className="info-highlight">
              ?�러?��? <strong>"?�너가 ?�직 ?�리??기쁨?�만 집중?????�도�??�자"</strong>??
              ?�순?��?�??�고??질문?�서 출발?�습?�다.
            </div>
            <p className="info-text" style={{ marginBottom: 0 }}>
              ?�국??로드 ?�이?��????�레???�닝까�? ?�국??모든 ?�?��? 가??빠르�?
              ?�확?�게 ?�내?�며, 참�? ???�아?????�전 코스 ?�보?� ?�너?�의 ?�직??
              경험?�을 ?�곳??모았?�니??
            </p>
          </div>

          <div className="story-img-container">
            <img src={runningImg} alt="?�랙 ?��? ?�차�??�리???�러???�너?? className="story-img" />
            <div className="story-float-badge">
              <Zap size={18} color="#38bdf8" />
              <span>?�께 ?�릴 ???�리????멀�? ???�래 ?�릴 ???�습?�다.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Core Pillars (?�심 기능) */}
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
          <h2>?�러?�이 ?�공?�는 4?� ?�심 ?�비??/h2>
        </div>
        <p className="info-text">
          목표 ?�?��? 고르�??�주 메달??목에 �??�까지 ?�요??모든 과정??지?�합?�다.
        </p>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Calendar size={22} />
              </div>
              <h3 className="pillar-title">1. ?�국 마라???�???�정 ?�브</h3>
            </div>
            <p className="pillar-desc">
              ?�울, 부?? ?�주 ???�국 ?�·도�??�?��? ?�코스, ?�프, 10km, 5km ??종목�??�터링을 지?�합?�다. 
              ?�수 ?�작/마감 D-Day ?�림?�로 ?�치�??�운 ?�청 ?�정??지켜드립니??
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <MapPin size={22} />
              </div>
              <h3 className="pillar-title">2. 추천 ?�닝 코스 & �?/h3>
            </div>
            <p className="pillar-desc">
              ?�국 곳곳???�름?�운 ?�닝 ?�팟�??�??코스�?지?��? ?�께 ?�인?�세?? 
              거리, 주�? ?�의?�설, ?�면 ?�태 ???�너???�높?�에??검증된 코스 ?�보�??�공?�니??
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Activity size={22} />
              </div>
              <h3 className="pillar-title">3. ?�이??& ?�포먼스 계산�?/h3>
            </div>
            <p className="pillar-desc">
              목표 ?�주 ?�간???�성?�기 ?�한 1km???��??�이?��? ?�모 칼로리�? 즉시 ?�출?�니?? 
              구간�????�?�을 미리 ?��??�이?�하??체계?�인 ?�이???�랜???�워보세??
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Users size={22} />
              </div>
              <h3 className="pillar-title">4. ?�너 커�??�티 & ?�전 ?�기</h3>
            </div>
            <p className="pillar-desc">
              물품보�????��??�간, ?�덕 주로 ?? 급수?� ?�치 ??주최�??�내문에?�는 
              찾기 ?�든 ?�제 참�??�들???�생??꿀?�과 ?�주 감동???�눌 ???�습?�다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5. Runner-First Principles (?�러?�의 ?�속) */}
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
          <h2>?�러?�의 3가지 ?�칙 (Our Principles)</h2>
        </div>

        <div className="principles-grid">
          <div className="principle-card">
            <div className="principle-icon">
              <ShieldCheck size={24} />
            </div>
            <h4 className="principle-title">?�확?�고 ?�제???�보</h4>
            <p className="principle-desc">
              공식 ?�강??바탕?�로 매주 직접 ?�이?��? 교차 검증하???�너?�게 ?�뢰?????�는 ?�보만을 ?�달?�니??
            </p>
          </div>

          <div className="principle-card">
            <div className="principle-icon">
              <Zap size={24} />
            </div>
            <h4 className="principle-title">빠르�?군더?�기 ?�는 UI</h4>
            <p className="principle-desc">
              과도??광고??불필?�한 ?�차 ?�이, ?�너가 ?�하???�?��? ?�보�?3�??�에 찾을 ???�도�?경량 ?�계?�었?�니??
            </p>
          </div>

          <div className="principle-card">
            <div className="principle-icon">
              <HeartHandshake size={24} />
            </div>
            <h4 className="principle-title">?�너?� ?�께 ?�장</h4>
            <p className="principle-desc">
              ?�너?�의 ?�중???�드백을 ?�극 경청?�며, 커�??�티??목소리�? ?�제 ?�비??개선??매주 즉각 반영?�니??
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
          <h2>지�??�러?�과 ?�께 ?�려보세??/h2>
        </div>

        <div className="cta-strip">
          <Link to="/marathon" className="cta-card">
            <div className="cta-info">
              <Calendar size={20} color="var(--primary)" />
              <span>?�국 마라???�정 보기</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/course" className="cta-card">
            <div className="cta-info">
              <MapPin size={20} color="var(--primary)" />
              <span>추천 ?�닝 코스 ?�색</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/performance" className="cta-card">
            <div className="cta-info">
              <Activity size={20} color="var(--primary)" />
              <span>?�닝 ?�이??계산�?/span>
            </div>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
            ?�비??개선 ?�안?�나 ?�업 문의???�제???�려 ?�습?�다.
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
            문의 �??�안 보내�?<ChevronRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
