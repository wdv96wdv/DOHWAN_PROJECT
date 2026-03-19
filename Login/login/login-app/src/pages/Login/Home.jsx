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
            Precision engineering for the modern runner. <br />
            Track your journey, discover your potential, and join a global movement.
          </p>
          <button className="btn-auth" onClick={handleGetStarted} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
            GET STARTED <ArrowRight size={20} style={{marginLeft: '12px'}} />
          </button>
        </div>
      </section>

      {/* AI Shoe Guide */}
      <section className="feature-section" data-aos="fade-up">
        <div className="feature-text">
          <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '2px' }}>NEXT-GEN TECH</div>
          <h2>AI SHOE GUIDE</h2>
          <p>
            Your running shoes are more than just footwear. We analyze your stride, biomechanics, and goals to match you with the perfect companion for your next PR.
          </p>
          <button className="btn-auth secondary" onClick={() => navigate("/recommend")}>
            FIND YOUR FIT <ChevronRight size={18} />
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
            Don't run alone. Connect with thousands of enthusiasts worldwide. Share your achievements, join local crews, and participate in exclusive events.
          </p>
          <button className="btn-auth secondary" onClick={() => navigate("/boards")}>
            VISIT COMMUNITY <ChevronRight size={18} />
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
            <p>ACTIVE RUNNERS</p>
          </div>
          <div className="stat-card">
            <h3><CountUp end={14800} duration={2.5} separator="," />km</h3>
            <p>TOTAL DISTANCE</p>
          </div>
          <div className="stat-card">
            <h3><CountUp end={98} duration={2.5} />%</h3>
            <p>SATISFACTION</p>
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
         <button className="btn-auth" onClick={handleGetStarted} style={{ padding: '16px 64px' }}>START YOUR JOURNEY</button>
      </footer>
    </div>
  );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
      { q: "Is it suitable for beginners?", a: "Absolutely. DoRunning offers custom plans designed for those starting from zero." },
      { q: "Does it sync with wearables?", a: "Integration with major smartwatches like Garmin and Apple Watch is currently in development." },
      { q: "Are there offline groups?", a: "Check the community tab to find and join local running crews in your area." },
    ];
    
    return (
      <section className="faq-section" data-aos="fade-up">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
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
