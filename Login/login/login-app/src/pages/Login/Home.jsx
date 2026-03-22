import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import recommend from "../../assets/img/recommend.jpg";
import marathon from "../../assets/video/marathon.mp4";
import banner1 from "../../assets/img/banner1.jpg";
import banner2 from "../../assets/img/banner2.jpg";
import banner3 from "../../assets/img/banner3.jpg";
import community from "../../assets/img/community.png";
import AOS from "aos";
import "aos/dist/aos.css";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import useAuthStore from "../../store/useAuthStore";
import "../../assets/css/home.css";
import "../../assets/css/auth.css";
import { ChevronRight, ArrowRight, Play, Plus, Minus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);

  const handleGetStarted = () => {
    if (isLogin === "true" || isLogin === true) {
      navigate("/record");
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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <video autoPlay loop muted className="hero-video" playsInline>
          <source src={marathon} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 data-aos="zoom-in">DORunning</h1>
          <p data-aos="fade-up" data-aos-delay="200">
            현대적인 러너를 위한 정밀한 트래킹 시스템. <br />
            당신의 여정을 기록하고, 잠재력을 발견하며, 전 세계 러너들과 함께하세요.
          </p>
          <button className="btn-auth" onClick={handleGetStarted} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
            시작하기
          </button>
        </div>
      </section>

      {/* AI Shoe Guide */}
      <section className="feature-section" data-aos="fade-up">
        <div className="feature-text">
          <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '2px' }}>NEXT-GEN TECH</div>
          <h2>AI SHOE GUIDE</h2>
          <p>
            러닝화는 단순한 신발 그 이상입니다. 당신의 걸음걸이와 생체학적 특성을 분석하여 최고의 기량을 낼 수 있는 완벽한 파트너를 찾아드립니다.
          </p>
          <button className="btn-auth secondary" onClick={() => navigate("/recommend")}>
            나에게 맞는 신발 찾기
          </button>
        </div>
        <div className="feature-media">
          <img src={recommend} alt="AI Shoe Recommendation" />
        </div>
      </section>

      {/* Community */}
      <section className="feature-section reverse" data-aos="fade-up">
        <div className="feature-text">
           <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '2px' }}>JOIN THE PACK</div>
          <h2>GLOBAL COMMUNITY</h2>
          <p>
            혼자 달리지 마세요. 전 세계 수천 명의 러너들과 소통하고, 성과를 공유하며, 지역 크루 및 전용 이벤트에 참여하세요.
          </p>
          <button className="btn-auth secondary" onClick={() => navigate("/boards")}>
            커뮤니티 방문하기
          </button>
        </div>
        <div className="feature-media">
          <img src={community} alt="Runner Community" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-aos="fade-up">
        <h2>EMPOWERING MILLIONS</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3><CountUp end={5240} duration={2.5} separator="," />+</h3>
            <p>활동 중인 러너</p>
          </div>
          <div className="stat-card">
            <h3><CountUp end={14800} duration={2.5} separator="," />km</h3>
            <p>총 누적 거리</p>
          </div>
          <div className="stat-card">
            <h3><CountUp end={98} duration={2.5} />%</h3>
            <p>사용자 만족도</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section" data-aos="fade-up">
        <h2>MOMENTS OF GLORY</h2>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
        >
          {[banner1, banner2, banner3].map((img, idx) => (
            <SwiperSlide key={idx}>
              <img src={img} alt={`Gallery ${idx + 1}`} className="gallery-img" />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      <footer className="home-footer" style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--glass-bg)' }}>
         <h2 style={{ fontFamily: 'Orbitron', marginBottom: '32px' }}>READY TO RUN?</h2>
         <button className="btn-auth" onClick={handleGetStarted} style={{ padding: '16px 64px' }}>지금 시작하기</button>
      </footer>
    </div>
  );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
      { q: "초보자도 이용 가능할까요?", a: "물론입니다. 두러닝은 입문자를 위한 맞춤형 트래킹 계획과 가이드를 제공합니다." },
      { q: "스마트 워치와 연동되나요?", a: "현재 가민(Garmin) 및 애플워치 등 주요 웨어러블 기기와의 데이터 연동 기능을 개발 중입니다." },
      { q: "오프라인 모임도 있나요?", a: "커뮤니티 탭을 통해 내 주변의 러닝 크루를 찾고 함께 달릴 수 있습니다." },
    ];
    
    return (
      <section className="faq-section" data-aos="fade-up">
        <h2>자주 묻는 질문</h2>
        {faqs.map((item, idx) => (
          <div key={idx} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {item.q}
              <span>{openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}</span>
            </button>
            {openIndex === idx && <p className="faq-answer">{item.a}</p>}
          </div>
        ))}
      </section>
    );
};

export default Home;
