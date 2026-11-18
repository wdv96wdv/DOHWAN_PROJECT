import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { ChevronRight, ArrowRight, Calendar, MapPin, Activity, BookOpen } from 'lucide-react';
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

    // Supabase 직접 ?�출 (?�늘 ?�후 ?�?�만, ?�수�??�터)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
    const todayStr = getTodayKstStr();

    setLoadingMarathon(true);

    const pageSize = 1000;
    let allData = [];

    const fetchPage = (offset) => {
      const url = `${SUPABASE_URL}/rest/v1/marathons`
        + `?select=id,title,location,race_date,start_date,end_date,type,link,is_first_come`
        + `&race_date=gte.${todayStr}`
        + `&order=race_date.asc`
        + `&limit=${pageSize}&offset=${offset}`;

      return fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
          return res.json();
        })
        .then(page => {
          allData = allData.concat(page);
          if (page.length === pageSize) return fetchPage(offset + pageSize);
          return allData;
        });
    };

    fetchPage(0)
      .then(data => {
        // 지�??�수 �? ?�수 기간 ??+ ?�?�일 미경�?
        const activeList = data
          .map(normalizeMarathon)
          .filter((item) => isOpenRegistration(item, todayStr));

        setActiveMarathonCount(activeList.length);

        // ?�수 마감?�이 가까운 ?�으�??�렬
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
      // Swiper가 ?�더�?????AOS ?�이?�웃???�시 계산?�도�???
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [upcomingMarathons]);

  return (
    <div className="home-page">
      <Helmet>
        <title>?�러?????�국 마라???�???�정</title>
        <meta name="description" content="?�러?��? ?�국 마라?�·러???�???�정??모으�? ?�청 ?�에 ?�요???�보�??�곳?�서 ?�인?�게 ??주는 ?�닝 ?�브?�니??" />
        <meta property="og:title" content="?�러?????�국 마라???�???�정" />
        <meta property="og:description" content="?�울부??지방까지, ?��??�는 ?�닝 ?�???�정�??�수 ?�보�?모았?�니??" />
        <link rel="canonical" href="https://www.dorunning.app/" />

        {/* ?�이�??�이???�름 구조???�이??*/}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "Dorunning",
            "alternateName": "?�러??,
            "url": "https://www.dorunning.app"
          })}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section">
        <video autoPlay loop muted className="hero-video" playsInline poster={marathonPoster}>
          <source src={marathon} type="video/mp4" />
        </video>
        <div className="hero-overlay-aurora"></div>
        <div className="hero-content">
          <span className="hero-badge" data-aos="fade-down">KOREA MARATHON HUB</span>
          <h1 data-aos="zoom-in" className="hero-title">Dorunning</h1>
          <p data-aos="fade-up" data-aos-delay="200" className="hero-subtitle">
            ?�국 마라?�·하?��?0K ?�정??모았?�니?? ?�수 기간, 거리, 지??��지 ?�곳?�서 비교?�세??
          </p>
          <div data-aos="fade-up" data-aos-delay="400" className="hero-action-group">
            <Link to="/marathon" className="hero-btn primary-glow">
              ?��??�는 ?�??보기 <ArrowRight size={20} />
            </Link>
            <Link to="/marathon" className="hero-btn outline">
              지??�� 찾아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Marathon Schedule Carousel */}
      <section className="marathon-carousel-section">
        <div className="home-section-header" data-aos="fade-up">
          <h2>지�??�수 중인 ?�??/h2>
          <p>?�수 마감?�이 가까운 ?�으�?보여 ?�립?�다.</p>
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
                  <Link to={`/marathon/${item.id}`} className="marathon-link-btn">
                    ?�세?�보 보기 <ChevronRight size={16} />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="no-active-marathons" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>지�??�수 중인 ?�?��? ?�습?�다.</h3>
            <p>?�터�??�히거나 ?�른 ?�을 ?�인??보세??</p>
          </div>
        )}
      </section>

      {/* Community */}
      <section className="feature-section reverse" data-aos="fade-up">
        <div className="feature-text">
          <div className="section-badge">COMMUNITY</div>
          <h2>?�신�?같�? ?�너?�과 ?�께</h2>
          <p>
            ?�자 ?�리지 마세?? ?�른 ?�너?�과 기록??공유?�고, ?�상???�누�?긍정?�인 ?�너지�??�으?�요. ?�유게시?��????�닝 ?�루 ?�증까�? 모든 것이 준비되???�습?�다.
          </p>
          <Link to="/boards" className="btn-feature">
            커�??�티 구경?�기 <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
        <div className="feature-media glass-media">
          <img src={community} alt="Runner Community" loading="lazy" />
        </div>
      </section>

      {/* Running Guide Magazine Section */}
      <section className="feature-section" data-aos="fade-up">
        <div className="feature-text">
          <div className="section-badge">MAGAZINE & TIPS</div>
          <h2>?�주�??�한 ?�닝 가?�드</h2>
          <p>
            ?�린??10K �??�주 ?�련 ?�랜, ??발에 맞는 ?�닝??고르??�? ?�??3????카보로딩 ?�단�??�너지????�� ?�령까�? ??마라??코치?�이 검증한 ?�전 가?�드�?지�??�어보세??
          </p>
          <Link to="/guide" className="btn-feature">
            ?�닝 가?�드 ?�기 <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
        <div className="feature-media glass-media" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '4px' }}>?�� 10K ?�주 8�??�랜</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>걷기?� ?�리기�? ?�진?�으�?결합?�여 부???�이 �??�니???�인???�과?�는 �?/p>
          </div>
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '4px' }}>?�� ?�닝???�택 가?�드</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>?�일�?쿠션?��???카본 ?�이?�화까�? ??주법??맞는 ?�발 찾는 기�?</p>
          </div>
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '4px' }}>?�� D-7 카보로딩 ?�단</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>30km 벽을 ?�기 ?�한 복합 ?�수?�물 로딩�??�???�일 ?�침 ?�사�?/p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-aos="fade-up">
        <h2 className="stats-title">?�러???�황</h2>
        <div className="stats-grid">
          <div className="stat-card glass-glow">
            <Activity className="stat-icon" size={36} />
            <h3><CountUp end={appStats.activeRunners} duration={2.5} separator="," />+</h3>
            <p>?�동 중인 ?�너</p>
          </div>
          <div className="stat-card glass-glow">
            <MapPin className="stat-icon" size={36} />
            <h3><CountUp end={appStats.totalDistance} duration={2.5} separator="," />km</h3>
            <p>�??�적 거리</p>
          </div>
          <div className="stat-card glass-glow">
            <Calendar className="stat-icon" size={36} />
            <h3><CountUp end={activeMarathonCount} duration={2.5} />�?/h3>
            <p>?�수 중인 ?�??/p>
          </div>
        </div>
      </section>

      <footer className="home-footer" data-aos="zoom-in">
        <div className="footer-glass-box">
          <h2 className="footer-title">관???�?�만 모아 ?�세??/h2>
          <p>?�시리스?�에 ?�아 ?�면 ?�수 ?�작·마감???��??????�시 찾기 ?�습?�다.</p>
          <Link to={isLogin === "true" || isLogin === true ? "/boards" : "/login"} className="hero-btn primary-glow">
            무료�??�작?�기
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
