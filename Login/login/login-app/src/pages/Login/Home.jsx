import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
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

const Home = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [activeMarathonCount, setActiveMarathonCount] = useState(0);
  const [appStats, setAppStats] = useState({ activeRunners: 5240, totalDistance: 14800 });

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

    // DB에서 실시간 마라톤 일정 가져와서 "접수중"인 메인 리스트 구성하기
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${API_BASE_URL}/api/marathons`)
      .then(res => {
          if (!res.ok) throw new Error("HTTP error!");
          if (res.status === 204) return [];
          return res.json();
      })
      .then(data => {
          const formatRawDate = (date) => {
              if (Array.isArray(date)) {
                  return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
              }
              return date;
          };

          const today = new Date();
          const kstOffset = 9 * 60 * 60 * 1000;
          const kstDate = new Date(today.getTime() + kstOffset);
          const todayStr = kstDate.toISOString().split('T')[0];

          const activeList = data.map(m => ({
              id: m.id,
              title: m.title,
              link: m.link,
              location: m.location,
              raceDate: formatRawDate(m.race_date),
              startDate: formatRawDate(m.start_date),
              endDate: formatRawDate(m.end_date),
              type: Array.isArray(m.type) ? m.type : ["마라톤"],
          })).filter(item => {
              if (item.startDate && item.endDate) {
                  return todayStr >= item.startDate && todayStr <= item.endDate;
              }
              return false;
          });

          setActiveMarathonCount(activeList.length);

          // 랜덤으로 7개 섞기
          const shuffled = activeList.sort(() => 0.5 - Math.random());
          setUpcomingMarathons(shuffled.slice(0, 7));
      })
      .catch(err => console.error("Failed to fetch marathons on home:", err));

    // Fetch app stats
    fetch(`${API_BASE_URL}/records/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 200 && data.data) {
          // data.data.activeRunners / data.data.totalDistance
          setAppStats({
            activeRunners: data.data.activeRunners > 0 ? data.data.activeRunners : 5240,
            totalDistance: data.data.totalDistance > 0 ? data.data.totalDistance : 14800
          });
        }
      })
      .catch(err => console.error("Failed to fetch app stats:", err));
  }, []);

  useEffect(() => {
    if (upcomingMarathons.length > 0) {
      // Swiper가 렌더링 된 후 AOS 레이아웃을 다시 계산하도록 함
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [upcomingMarathons]);

  return (
    <div className="home-page">
      <Helmet>
        <title>Dorunning (두러닝) - 전국 마라톤 대회 일정 및 러닝 기록 관리</title>
        <meta name="description" content="두러닝(Dorunning)에서 전국 마라톤 대회 일정 정보부터 나의 러닝 기록까지 한 번에 관리하세요! 스마트한 러너들의 프리미엄 커뮤니티." />
        <meta property="og:title" content="Dorunning (두러닝) - 전국 마라톤 대회 일정 및 러닝 기록 관리" />
        <meta property="og:description" content="전국 마라톤 대회 일정 정보부터 나의 러닝 기록까지 한 번에 관리하세요!" />
        <link rel="canonical" href="https://dorunning.vercel.app/" />
        
        {/* 네이버 사이트 이름 구조화 데이터 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "Dorunning",
            "alternateName": "두러닝",
            "url": "https://dorunning.vercel.app"
          })}
        </script>
      </Helmet>
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
      <section className="marathon-carousel-section">
        <div className="home-section-header" data-aos="fade-up">
           <div className="section-badge">ACCEPTING NOW</div>
           <h2>현재 접수 중인 마라톤 일정</h2>
           <p>당신의 도전을 기다리고 있는 다가오는 경기들을 확인하세요</p>
        </div>
        
        {upcomingMarathons.length > 0 ? (
          <Swiper
            key={upcomingMarathons.length}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            spaceBetween={30}
            centeredSlidesBounds={true}
            observer={true}
            observeParents={true}
            watchSlidesProgress={true}
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
              <SwiperSlide key={item.id || idx} className="marathon-slide">
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
        ) : (
          <div className="no-active-marathons" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>현재 접수 중인 마라톤 대회가 없습니다.</h3>
            <p>다음에 열릴 멋진 대회들을 기대해 주세요!</p>
          </div>
        )}
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
            <h3><CountUp end={appStats.activeRunners} duration={2.5} separator="," />+</h3>
            <p>활동 중인 러너</p>
          </div>
          <div className="stat-card glass-glow">
            <MapPin className="stat-icon" size={36} />
            <h3><CountUp end={appStats.totalDistance} duration={2.5} separator="," />km</h3>
            <p>총 누적 거리</p>
          </div>
          <div className="stat-card glass-glow">
            <Calendar className="stat-icon" size={36} />
            <h3><CountUp end={activeMarathonCount} duration={2.5} />개</h3>
            <p>접수 중인 대회</p>
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
