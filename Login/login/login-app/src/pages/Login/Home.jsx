import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from "framer-motion";
import marathon from "../../assets/video/marathon.mp4";
import community from "../../assets/img/community.png";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import useAuthStore from "../../store/useAuthStore";
import "../../assets/css/home.css";
import "../../assets/css/auth.css";
import { ChevronRight, ArrowRight, Calendar, MapPin, Activity, Users } from 'lucide-react';
import Skeleton from "../../components/Common/Skeleton";
import marathonPoster from "../../assets/img/marathon-poster.png";

const Home = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [activeMarathonCount, setActiveMarathonCount] = useState(0);
  const [appStats, setAppStats] = useState({ activeRunners: 5240, totalDistance: 14800 });
  const [loadingMarathon, setLoadingMarathon] = useState(true);

  // Parallax effect for Hero
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  const handleGetStarted = () => {
    if (isLogin === "true" || isLogin === true) {
      navigate("/boards");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    setLoadingMarathon(true);
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

        // 랜덤 7개
        const shuffled = activeList.sort(() => 0.5 - Math.random());
        setUpcomingMarathons(shuffled.slice(0, 7));
      })
      .catch(err => console.error("Failed to fetch marathons on home:", err))
      .finally(() => setLoadingMarathon(false));

    // Stats fetch
    fetch(`${API_BASE_URL}/records/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 200 && data.data) {
          setAppStats({
            activeRunners: data.data.activeRunners > 0 ? data.data.activeRunners : 5240,
            totalDistance: data.data.totalDistance > 0 ? data.data.totalDistance : 14800
          });
        }
      })
      .catch(err => console.error("Failed to fetch app stats:", err));
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>두러닝 (Dorunning) | 전국 마라톤 대회 일정 및 러닝 커뮤니티</title>
        <meta name="description" content="두러닝(Dorunning)에서 전국 마라톤 대회 일정 정보부터 나의 러닝 기록까지 한 번에 관리하세요! 스마트한 러너들을 위한 프리미엄 트래킹 커뮤니티." />
        <link rel="canonical" href="https://dorunning.vercel.app/" />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.video 
          style={{ y: yHero, opacity: opacityHero }}
          autoPlay loop muted playsInline 
          className="hero-video" 
          poster={marathonPoster}
        >
          <source src={marathon} type="video/mp4" />
        </motion.video>
        <div className="hero-overlay-aurora"></div>
        
        <motion.div 
          className="hero-content"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="hero-badge">PREMIUM RUNNING CLUB</motion.div>
          <motion.h1 variants={fadeInUp} className="hero-title">RUN FORWARD</motion.h1>
          <motion.p variants={fadeInUp} className="hero-subtitle">
            스스로의 한계를 넘어서는 순간. <br />
            현대적인 러너들을 위한 프리미엄 트래킹 커뮤니티
          </motion.p>
          <motion.div variants={fadeInUp} className="hero-action-group">
            <button className="btn-auth hero-btn primary-glow" onClick={handleGetStarted}>
              지금 시작하기 <ArrowRight size={20} />
            </button>
            <button className="btn-auth outline hero-btn" onClick={() => navigate("/marathon")}>
              마라톤 일정 보기
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Marathon Carousel Section */}
      <section className="marathon-carousel-section">
        <motion.div 
          className="home-section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="section-badge">UPCOMING EVENTS</div>
          <h2>현재 접수 중인 마라톤 일정</h2>
          <p>당신의 도전을 기다리고 있는 다가오는 경기들을 확인하세요</p>
        </motion.div>

        {loadingMarathon ? (
          <div className="skeleton-grid-home">
            {[1, 2, 3].map(i => (
              <div key={i} className="marathon-slide"><Skeleton type="card" /></div>
            ))}
          </div>
        ) : upcomingMarathons.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Swiper
              slidesPerView={'auto'}
              spaceBetween={24}
              centeredSlides={true}
              grabCursor={true}
              rewind={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              modules={[Pagination, Autoplay]}
              className="marathon-swiper"
            >
              {upcomingMarathons.map((item) => (
                <SwiperSlide key={item.id} className="marathon-slide">
                  <div className="marathon-card-glass">
                    <div className="marathon-card-header">
                      <span><MapPin size={18} color="#60a5fa" /> {item.location}</span>
                      <span><Calendar size={18} color="#60a5fa" /> {item.raceDate}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <div className="marathon-tags">
                      {item.type.map(t => <span key={t} className="marathon-tag">{t}</span>)}
                    </div>
                    <Link to={`/marathon/${item.id}`} className="marathon-link-btn">
                      상세정보 보기 <ChevronRight size={18} />
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
            <Calendar size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>현재 접수 중인 마라톤 대회가 없습니다.</h3>
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="feature-section reverse">
        <motion.div 
          className="feature-text"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="section-badge">GLOBAL COMMUNITY</div>
          <h2>당신과 같은 러너들과 함께</h2>
          <p>
            혼자 달리지 마세요. 수천 명의 러너들과 기록을 공유하고, 일상을 나누며 긍정적인 에너지를 얻으세요. 자유게시판부터 러닝 크루 인증까지 모든 것이 준비되어 있습니다.
          </p>
          <button className="btn-feature" onClick={() => navigate("/boards")}>
            커뮤니티 구경하기 <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </motion.div>
        
        <motion.div 
          className="feature-media glass-media"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="media-overlay-glow"></div>
          <img src={community} alt="Runner Community" loading="lazy" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <motion.h2 
          className="stats-title"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          EMPOWERING MILLIONS
        </motion.h2>
        
        <motion.div 
          className="stats-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="stat-card glass-glow">
            <Users className="stat-icon" size={48} />
            <h3><CountUp end={appStats.activeRunners} duration={2.5} separator="," />+</h3>
            <p>활동 중인 러너</p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="stat-card glass-glow">
            <Activity className="stat-icon" size={48} />
            <h3><CountUp end={appStats.totalDistance} duration={2.5} separator="," />km</h3>
            <p>총 누적 거리</p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="stat-card glass-glow">
            <Calendar className="stat-icon" size={48} />
            <h3><CountUp end={activeMarathonCount} duration={2.5} />개</h3>
            <p>접수 중인 대회</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <footer className="home-footer">
        <motion.div 
          className="footer-glass-box"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="footer-title">READY TO RUN?</h2>
          <p>지금 바로 로그인하고 나만의 러닝 리포트를 만들어보세요.</p>
          <button className="hero-btn primary-glow" onClick={handleGetStarted} style={{ padding: '20px 48px', fontSize: '1.2rem' }}>
            여정 시작하기
          </button>
        </motion.div>
      </footer>
    </div>
  );
};

export default Home;
