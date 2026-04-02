import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import recommend from "../../assets/img/recommend.jpg";
import marathon from "../../assets/video/marathon.mp4";
import community from "../../assets/img/community.png";
import AOS from "aos";
import "aos/dist/aos.css";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import useAuthStore from "../../store/useAuthStore";
import "../../assets/css/home.css";
import "../../assets/css/auth.css";
import { ChevronRight, ArrowRight, Calendar, MapPin, Activity } from 'lucide-react';
import { MARATHON_LIST } from "../../utils/marathon";

const Home = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);

  const handleGetStarted = () => {
    if (isLogin === "true" || isLogin === true) {
      navigate("/boards");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 120,
      delay: 100,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // Get upcoming marathons
  const upcomingMarathons = MARATHON_LIST.slice(0, 7);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <video autoPlay loop muted className="hero-video" playsInline>
          <source src={marathon} type="video/mp4" />
        </video>
        <div className="hero-overlay-glass"></div>
        <div className="hero-content">
          <div data-aos="fade-down" className="hero-badge">DORUNNING EXCLUSIVE</div>
          <h1 data-aos="zoom-in" className="hero-title">RUN FORWARD</h1>
          <p data-aos="fade-up" data-aos-delay="200" className="hero-subtitle">
            스스로의 한계를 넘어서는 순간. <br />
            현대적인 러너들을 위한 프리미엄 트래킹 커뮤니티
          </p>
          <div data-aos="fade-up" data-aos-delay="400" className="hero-action-group">
            <button className="btn-auth hero-btn primary-glow" onClick={handleGetStarted}>
              지금 시작하기 <ArrowRight size={20} />
            </button>
            <button className="btn-auth outline hero-btn" onClick={() => navigate("/marathon")}>
              마라톤 일정 보기
            </button>
          </div>
        </div>
      </section>

      {/* Marathon Schedule Carousel */}
      <section className="marathon-carousel-section" data-aos="fade-up">
        <div className="section-header">
           <div className="section-badge">UPCOMING EVENTS</div>
           <h2>전국 주요 마라톤 일정</h2>
           <p>당신의 도전을 기다리고 있는 다가오는 경기들을 확인하세요</p>
        </div>
        
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="marathon-swiper"
        >
          {upcomingMarathons.map((item, idx) => (
            <SwiperSlide key={idx} className="marathon-slide">
              <div className="marathon-card-glass">
                <div className="marathon-card-header">
                   <span className="marathon-location"><MapPin size={16}/> {item.location}</span>
                   <span className="marathon-date"><Calendar size={16}/> {item.raceDate}</span>
                </div>
                <h3>{item.title}</h3>
                <div className="marathon-tags">
                  {item.type.map(t => <span key={t} className="marathon-tag">{t}</span>)}
                </div>
                <button className="marathon-link-btn" onClick={() => navigate(`/marathon/${item.id}`)}>
                   상세정보 보기 <ChevronRight size={16} />
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* AI Shoe Guide */}
      <section className="feature-section" data-aos="fade-up">
        <div className="feature-text">
          <div className="section-badge">NEXT-GEN TECH</div>
          <h2>AI SHOE GUIDE</h2>
          <p>
            러닝화는 단순한 신발 그 이상입니다. 당신의 걸음걸이와 생체학적 특성을 분석하여 최고의 기량을 낼 수 있는 완벽한 파트너를 찾아드립니다.
          </p>
          <button className="btn-auth btn-feature" onClick={() => navigate("/recommend")}>
            나에게 맞는 신발 찾기 <ArrowRight size={18} style={{marginLeft: '8px'}} />
          </button>
        </div>
        <div className="feature-media glass-media">
          <img src={recommend} alt="AI Shoe Recommendation" />
        </div>
      </section>

      {/* Community */}
      <section className="feature-section reverse" data-aos="fade-up">
        <div className="feature-text">
           <div className="section-badge">GLOBAL COMMUNITY</div>
          <h2>당신과 같은 러너들과 함께</h2>
          <p>
            혼자 달리지 마세요. 수천 명의 러너들과 기록을 공유하고, 일상을 나누며 긍정적인 에너지를 얻으세요. 자유게시판부터 러닝 크루 인증까지 모든 것이 준비되어 있습니다.
          </p>
          <button className="btn-auth btn-feature" onClick={() => navigate("/boards")}>
            커뮤니티 구경하기 <ArrowRight size={18} style={{marginLeft: '8px'}} />
          </button>
        </div>
        <div className="feature-media glass-media">
          <img src={community} alt="Runner Community" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-aos="fade-up">
        <h2 className="stats-title">EMPOWERING MILLIONS</h2>
        <div className="stats-grid">
          <div className="stat-card glass-glow">
            <Activity className="stat-icon" size={36} />
            <h3><CountUp end={5240} duration={2.5} separator="," />+</h3>
            <p>활동 중인 러너</p>
          </div>
          <div className="stat-card glass-glow">
            <MapPin className="stat-icon" size={36} />
            <h3><CountUp end={14800} duration={2.5} separator="," />km</h3>
            <p>총 누적 거리</p>
          </div>
          <div className="stat-card glass-glow">
            <Calendar className="stat-icon" size={36} />
            <h3><CountUp end={98} duration={2.5} />%</h3>
            <p>사용자 만족도</p>
          </div>
        </div>
      </section>

      <footer className="home-footer" data-aos="zoom-in">
         <div className="footer-glass-box">
             <h2 className="footer-title">READY TO RUN?</h2>
             <p>지금 바로 로그인하고 나만의 러닝 리포트를 만들어보세요.</p>
             <button className="btn-auth hero-btn primary-glow" onClick={handleGetStarted}>
                여정 시작하기
             </button>
         </div>
      </footer>
    </div>
  );
};

export default Home;
