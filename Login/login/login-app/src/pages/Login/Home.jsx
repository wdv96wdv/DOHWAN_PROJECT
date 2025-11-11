import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/css/Home.module.css";
import recommendRh from "../../assets/img/recommendRh.jpg";
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
import heroImage1 from "../../assets/img/dongapopup.png";
import heroImage2 from "../../assets/img/jtbcpopup.jpg";
import { LoginContext } from "../../contexts/LoginContextProvider"; // 경로는 실제 위치에 맞게 조정


// ========================
// 팝업 컴포넌트
// ========================
const Popup = ({
  id, // 팝업 고유 ID
  imageSrc,
  linkUrl,
  width = "300px",
  height = "auto",
  position = { top: "10%", left: "85%", transform: "translateX(0)" },
  zIndex = 9998, // AdSense 광고(9999)보다 낮게 설정하여 충돌 방지
}) => {
  const [visible, setVisible] = useState(false);
  const [mobilePosition, setMobilePosition] = useState(position);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const hideUntil = localStorage.getItem(`hidePopup_${id}`);
    if (hideUntil !== today) setVisible(true);
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMobilePosition({ top: "25%", left: "50%", transform: "translateX(-50%)" });
      } else {
        setMobilePosition(position);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  const closePopup = (hideToday = false) => {
    if (hideToday) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`hidePopup_${id}`, today);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "absolute", ...mobilePosition, width, zIndex }}>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          position: "relative",
          backgroundColor: "white",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            closePopup();
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            width: 24,
            height: 24,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          X
        </button>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={imageSrc}
            alt="팝업 이미지"
            style={{ width: "100%", height, display: "block" }}
          />
        </a>
        <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePopup(true);
            }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
            }}
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePopup();
            }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};


const Home = () => {
  const navigate = useNavigate();
  const { isLogin } = useContext(LoginContext);

  const handleClick = () => {
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
      mirror: false,
    });
  }, []);

  // 섹션 컴포넌트 모음
  const HeroSection = () => (
    <section className={styles.hero}>
      <video autoPlay loop muted className={styles.heroVideo} playsInline>
        <source src={marathon} type="video/mp4" />
      </video>
      <div className={styles.heroContent}>
        <h1>DoRunning</h1>
        <p>
          운동을 시작하려는 사람부터 마라톤을 수년간 달린 사람까지, 짧은 일일 운동으로 여러분을 코칭하여 달리기의 고민을 없애드립니다.
        </p>
        <button className={styles.ctaBtn} onClick={handleClick}>
          지금 시작하기
        </button>


      </div>
    </section>
  );

  const AboutSection = () => (
    <section className={styles.about} data-aos="fade-up">
      <h2>우리의 목표</h2>
      <p>
        우리는 단순히 운동 프로그램을 제공하는 것이 아니라,
        지속 가능한 운동 습관을 만드는 여정을 함께합니다.
        당신의 첫 걸음이 더 이상 두렵지 않도록 도와드릴게요.
      </p>
    </section>
  );

  const RecommendSection = () => (
    <section className={styles.training} data-aos="fade-right">
      <div className={styles.trainingText}>
        <h2>러닝화 추천</h2>
        <p>
          러닝화는 단순한 운동화가 아닙니다. 당신의 러닝 목적, 발 모양, 착용감까지 고려해<br />
          가장 잘 맞는 러닝화를 정교하게 추천해드립니다. 지금 당신의 러닝을 더 편안하고, 더 강력하게 만들어보세요.
        </p>
        <button className={styles.ctaBtn} onClick={() => navigate("/recommend")}>러닝화 추천받기</button>
      </div>
      <div className={styles.recommendRh}>
        <img src={recommendRh} alt="recommendRh" className={styles.recommendRhImg} />
        <p className={styles.imageCredit}>
          <a
            href="https://kr.freepik.com/free-photo/sporty-man-training-outdoors-london_12750620.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            작가 wirestock 출처 Freepik
          </a>
        </p>
      </div>
    </section>
  );

  const CoachingSection = () => (
    <section className={styles.coaching} data-aos="fade-left">
      <div className={styles.coachingContent}>
        <div className={styles.coachingText}>
          <h2>맞춤형 코칭 및 커뮤니티</h2>
          <p>
            지원 커뮤니티 및 코치<br />
            뒤에 팀이 있을 때 달리기가 더 쉬워집니다. 우리 커뮤니티는 여러분에게 도로에서 얻은 이야기와 도움이 필요할 때 도움을 줄 것입니다.<br />
            홍보물, 땀에 젖은 셀카, 산책로에 있는 강아지 사진을 공유해 주세요!<br />
            AI 기반 피드백과 트레이너의 조언으로 최고의 결과를 만들어보세요.
          </p>
          <button className={styles.ctaBtn} onClick={() => navigate("/boards")}>
            커뮤니티 가기
          </button>
        </div>
        <div className={styles.coachingImgWrapper}>
          <img src={community} alt="Coaching" className={styles.coachingImg} />
        </div>
      </div>
    </section>
  );

  const FeaturesSection = () => (
    <section className={styles.features} data-aos="zoom-in-up">
      <h2>주요 기능</h2>
      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <h3>운동 기록</h3>
          <p>매일의 운동을 기록하고 나의 발전을 한눈에 확인하세요.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>영상 코칭</h3>
          <p>전문 코치의 영상을 통해 자세와 속도를 배워보세요.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>목표 관리</h3>
          <p>나만의 목표를 설정하고 달성할 때마다 뱃지를 받아보세요.</p>
        </div>
      </div>
    </section>
  );

  const TestimonialsSection = () => (
    <section className={styles.testimonials} data-aos="fade-up">
      <h2>회원들의 이야기</h2>
      <div className={styles.testimonial}>
        <p>"5개월 만에 처음으로 10km 55분 페이스로 달렸습니다!"</p>
        <cite>김두환</cite>
      </div>
      <div className={styles.testimonial}>
        <p>"이 프로그램 덕분에 나의 운동 습관이 달라졌어요!"</p>
        <cite>김두환</cite>
      </div>
    </section>
  );

  const GallerySection = () => {
    const images = [banner1, banner2, banner3];
    return (
      <section className={styles.gallery} data-aos="fade-up">
        <h2>활동 갤러리</h2>
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img src={img} alt={`활동 ${idx + 1}`} className={styles.galleryImg} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  };

  const StatsSection = () => (
    <section className={styles.stats} data-aos="fade-up">
      <h2>우리와 함께한 기록</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3><CountUp end={5000} duration={2} />+</h3>
          <p>누적 회원 수</p>
        </div>
        <div className={styles.statCard}>
          <h3><CountUp end={12000} duration={2} />km</h3>
          <p>달린 거리</p>
        </div>
        <div className={styles.statCard}>
          <h3><CountUp end={350} duration={2} />+</h3>
          <p>성공 사례</p>
        </div>
      </div>
    </section>
  );

  const FAQSection = () => {
    const [openIndex, setOpenIndex] = React.useState(null);
    const faqs = [
      { q: "회원가입은 무료인가요?", a: "네, 모든 기능을 무료로 체험할 수 있습니다." },
      { q: "프로그램 변경이 가능한가요?", a: "언제든 내 체력과 목표에 맞춰 변경 가능합니다." },
      { q: "트레이너와 상담할 수 있나요?", a: "AI 피드백과 전문 트레이너 상담을 제공합니다." },
    ];
    return (
      <section className={styles.faq} data-aos="fade-up">
        <h2>자주 묻는 질문</h2>
        {faqs.map((item, idx) => (
          <div key={idx} className={styles.faqItem}>
            <button
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {item.q}
            </button>
            {openIndex === idx && <p className={styles.faqAnswer}>{item.a}</p>}
          </div>
        ))}
      </section>
    );
  };

  const CallToActionSection = () => (
    <section className={styles.cta} data-aos="zoom-in">
      <h2>지금 시작해 보세요</h2>
      <p>여러분의 달리기 목표를 달성할 준비가 되셨나요?</p>
      <button className={styles.ctaBtn} onClick={() => navigate("/join")}>
        회원가입하기
      </button>
    </section>
  );

  return (
    <div className={styles.home}>
      {/* ================= Popup 렌더링 ================= */}
      {/* <Popup
        id="eventPopup"
        imageSrc={heroImage1}
        linkUrl="https://seoul-marathon.com/"
        position={{ top: "55%", left: "85%", transform: "translateX(-50%)" }}
      />

      <Popup
        id="noticePopup"
        imageSrc={heroImage2}
        linkUrl="https://marathon.jtbc.com/"
        position={{ top: "15%", left: "85%", transform: "translateX(-50%)" }}
      /> */}

      <HeroSection />
      {/* <AboutSection /> */}
      <RecommendSection />
      <CoachingSection />
      {/* <FeaturesSection /> */}
      {/* <TestimonialsSection /> */}
      <GallerySection />
      <StatsSection />
      <FAQSection />
      {/* <CallToActionSection /> */}
    </div>
  );
};

export default Home;
