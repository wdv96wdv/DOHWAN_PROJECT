import React, { useState, useEffect, useContext } from "react";
import styles from "../../assets/css/Home.module.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css'; // ✅ SweetAlert2 CSS import
import "../../assets/css/fonts.css"; // ✅ Google Fonts import

import { list } from "../../apis/boards.js"

import heroImage1 from "../../assets/img/dongapopup.png";
import heroImage2 from "../../assets/img/jtbcpopup.jpg";
import { LoginContext } from "../../contexts/LoginContextProvider";

const Popup = ({ imageSrc, linkUrl, width = "300px", height = "auto", position = { top: "10%", left: "50%", transform: "translateX(-50%)" }, zIndex = 1000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("popupHideUntil");
    if (!hideUntil || new Date().getTime() > Number(hideUntil)) {
      setVisible(true);
    }
  }, []);

  const closePopup = (hideToday = false) => {
    if (hideToday) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      localStorage.setItem("popupHideUntil", endOfDay.getTime());
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "absolute", ...position, zIndex }}>
      <div style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", position: "relative" }} onClick={() => closePopup()}>
        <button
          onClick={(e) => { e.stopPropagation(); closePopup(); }}
          style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", width: 24, height: 24, cursor: "pointer", fontWeight: "bold", color: "white" }}
        >
          X
        </button>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          <img src={imageSrc} alt="팝업 이미지" style={{ width, height, display: "block" }} onClick={(e) => e.stopPropagation()} />
        </a>
        <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
          <button onClick={(e) => { e.stopPropagation(); closePopup(true); }} style={{ flex: 1, padding: 10, border: "none", cursor: "pointer", backgroundColor: "white" }}>
            오늘 하루 보지 않기
          </button>
          <button onClick={(e) => { e.stopPropagation(); closePopup(); }} style={{ flex: 1, padding: 10, border: "none", cursor: "pointer", backgroundColor: "white" }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { isLogin } = useContext(LoginContext);
  const [boards, setBoards] = useState([]);

  // 테스트용 하드코딩 데이터
  // const boards = [
  //   { id: 1, title: "첫 번째 게시글", author: "두환", createdAt: "2025-10-10T10:00:00Z" },
  //   { id: 2, title: "두 번째 게시글", author: "하정", createdAt: "2025-10-09T15:00:00Z" },
  //   { id: 3, title: "세 번째 게시글", author: "두현", createdAt: "2025-10-08T12:30:00Z" },
  //   { id: 4, title: "네 번째 게시글", author: "은상", createdAt: "2025-10-07T08:45:00Z" },
  //   { id: 5, title: "다섯 번째 게시글", author: "익명", createdAt: "2025-10-06T18:20:00Z" },
  // ];

  useEffect(() => {
    // 페이지 0, 사이즈 5로 최신 5개 가져오기
    list(0, 5)
      .then((res) => {
        console.log("API 응답 구조:", res);
        setBoards(res.data.list); // res.data 형식이 [{id, title, author, createdAt}, ...]여야 함
      })
      .catch((err) => console.error(err));
  }, []);

  const navigate = useNavigate();
  const popups = [
    { img: heroImage1, link: "https://marathon.jtbc.com/", position: { top: "26%", left: "85%", transform: "translateX(-50%)" } },
    { img: heroImage2, link: "https://seoul-marathon.com/", position: { top: "6%", left: "85%", transform: "translateX(-50%)" } }
  ];

  const handleStart = () => {
    if (isLogin) {
      navigate("/record");
    } else {
      Swal.fire({
        title: "로그인이 필요합니다",
        text: "로그인 페이지로 이동하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "이동",
        cancelButtonText: "취소"
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
    }
  };

  return (
    <div className={styles.home}>
      {/* 팝업 */}
      {popups.map((p, idx) => <Popup key={idx} imageSrc={p.img} linkUrl={p.link} position={p.position} />)}

      {/* Hero 섹션 */}
      <section className={styles.hero}>
        <h1>DoRunning</h1>
        <p>나의 러닝 기록을 쉽고 간단하게 관리하세요 🏃‍♂️</p>
        <div className={styles.cta}>
          <button className={styles.btnPrimary} onClick={handleStart}>기록 시작하기</button>
          {!isLogin && <button className={styles.btnSecondary} onClick={() => navigate("/login")}>로그인</button>}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>핵심 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>📝 기록 관리</h3>
            <p>러닝 거리, 페이스, 노트를 손쉽게 기록하세요.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>📊 통계 보기</h3>
            <p>주간/월간 기록을 그래프로 확인할 수 있어요.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>🔍 검색/필터</h3>
            <p>날짜, 제목으로 원하는 기록을 바로 찾아보세요.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>☁️ 어디서든 접속</h3>
            <p>로그인만 하면 언제 어디서든 기록이 저장됩니다.</p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className={styles.communitySection}>
        <h2 className={styles.sectionTitle}>🏃‍♀️ 커뮤니티 최신글</h2>
        <div className={styles.communityList}>
          {boards.length > 0 ? (
            boards.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className={styles.communityCard}
                onClick={() => navigate(`/boards/${post.id}`)}
              >
                <h3>{post.title}</h3>
                <p>{post.author}</p>
                <small>{new Date(post.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>아직 작성된 게시글이 없습니다.</p>
          )}
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => navigate("/boards")}
        >
          커뮤니티 더보기 ➡️
        </button>
      </section>

      {/* 하단 CTA */}
      {!isLogin && (
        <section className={styles.callToAction}>
          <h2>지금 바로 시작해보세요!</h2>
          <button className={styles.btnPrimary} onClick={() => navigate("/join")}>회원가입하기</button>
        </section>
      )}
    </div>
  );
};

export default Home;
