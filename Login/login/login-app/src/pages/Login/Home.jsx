import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
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
import Skeleton from "../../components/Common/Skeleton";
import marathonPoster from "../../assets/img/marathon-poster.png";
import {
  normalizeMarathon,
  isOpenRegistration,
  compareByEndDateAsc,
  getTodayKstStr,
} from "../../utils/marathonHelpers";

const Home = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [activeMarathonCount, setActiveMarathonCount] = useState(0);
  const [appStats, setAppStats] = useState({ activeRunners: 0, totalDistance: 0 });
  const [loadingMarathon, setLoadingMarathon] = useState(true);

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
    setLoadingMarathon(true);
    fetch(`${API_BASE_URL}/api/marathons`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error!");
        if (res.status === 204) return [];
        return res.json();
      })
      .then(data => {
        const todayStr = getTodayKstStr();
        // 지금 접수 중: 접수 기간 안 + 대회일 미경과 (과거/종료 제외)
        const activeList = data
          .map(normalizeMarathon)
          .filter((item) => isOpenRegistration(item, todayStr));

        setActiveMarathonCount(activeList.length);

        // 접수 마감일이 가까운 순으로 정렬
        const sorted = [...activeList].sort(compareByEndDateAsc);
        setUpcomingMarathons(sorted.slice(0, 7));
      })
      .catch(err => console.error("Failed to fetch marathons on home:", err))
      .finally(() => setLoadingMarathon(false));

    // Fetch app stats
    fetch(`${API_BASE_URL}/records/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 200 && data.data) {
          // data.data.activeRunners / data.data.totalDistance
          setAppStats({
            activeRunners: data.data.activeRunners || 0,
            totalDistance: data.data.totalDistance || 0
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
        <title>두러닝 – 전국 마라톤 대회 일정</title>
        <meta name="description" content="두러닝은 전국 마라톤·러닝 대회 일정을 모으고, 신청 전에 필요한 정보를 한곳에서 확인하게 해 주는 러닝 허브입니다." />
        <meta property="og:title" content="두러닝 – 전국 마라톤 대회 일정" />
        <meta property="og:description" content="서울부터 지방까지, 다가오는 러닝 대회 일정과 접수 정보를 모았습니다." />
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
        <video autoPlay loop muted className="hero-video" playsInline poster={marathonPoster}>
          <source src={marathon} type="video/mp4" />
        </video>
        <div className="hero-overlay-glass"></div>
        <div className="hero-content">
          <h1 data-aos="zoom-in" className="hero-title">다음 대회, 놓치지 마세요</h1>
          <p data-aos="fade-up" data-aos-delay="200" className="hero-subtitle">
            전국 마라톤·하프·10K 일정을 모았습니다. 접수 기간, 거리, 지역까지 한곳에서 비교하세요.
          </p>
          <div data-aos="fade-up" data-aos-delay="400" className="hero-action-group">
            <button className="btn-auth hero-btn primary-glow" onClick={() => navigate("/marathon")}>
              다가오는 대회 보기 <ArrowRight size={20} />
            </button>
            <button className="btn-auth outline hero-btn" onClick={() => navigate("/marathon")}>
              지역별 찾아보기
            </button>
          </div>
        </div>
      </section>

      {/* Marathon Schedule Carousel */}
      <section className="marathon-carousel-section">
        <div className="home-section-header" data-aos="fade-up">
          <h2>지금 접수 중인 대회</h2>
          <p>접수 마감일이 가까운 순으로 보여 드립니다.</p>
        </div>

        {loadingMarathon ? (
          <div className="skeleton-grid-home">
            {[1, 2, 3].map(i => (
              <div key={i} className="marathon-slide"><Skeleton type="card" /></div>
            ))}
          </div>
        ) : upcomingMarathons.length > 0 ? (
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
                    <span className="marathon-location"><MapPin size={16} /> {item.location}</span>
                    <span className="marathon-date"><Calendar size={16} /> {item.raceDate}</span>
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
            <h3>지금 접수 중인 대회가 없습니다.</h3>
            <p>필터를 넓히거나 다른 달을 확인해 보세요.</p>
          </div>
        )}
      </section>

      {/* Community */}
      <section className="feature-section reverse" data-aos="fade-up">
        <div className="feature-text">
          <div className="section-badge">COMMUNITY</div>
          <h2>당신과 같은 러너들과 함께</h2>
          <p>
            혼자 달리지 마세요. 다른 러너들과 기록을 공유하고, 일상을 나누며 긍정적인 에너지를 얻으세요. 자유게시판부터 러닝 크루 인증까지 모든 것이 준비되어 있습니다.
          </p>
          <button className="btn-auth btn-feature" onClick={() => navigate("/boards")}>
            커뮤니티 구경하기 <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </div>
        <div className="feature-media glass-media">
          <img src={community} alt="Runner Community" loading="lazy" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-aos="fade-up">
        <h2 className="stats-title">두러닝 현황</h2>
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
          <h2 className="footer-title">관심 대회만 모아 두세요</h2>
          <p>위시리스트에 담아 두면 접수 시작·마감이 다가올 때 다시 찾기 쉽습니다.</p>
          <button className="btn-auth hero-btn primary-glow" onClick={handleGetStarted}>
            무료로 시작하기
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
