import React from "react";
import { Link } from "react-router-dom";
import '../../assets/css/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-info">
          <h4>DORUNNING</h4>
          <p className="footer-text">
            러닝 기록 관리부터 마라톤 일정 확인까지, 
            당신의 모든 러닝 여정을 함께하는 스마트 러닝 파트너입니다.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>플랫폼</h4>
          <div className="footer-links">
            <Link to="/about">소개</Link>
            <Link to="/marathon">마라톤</Link>
            <Link to="/course">코스</Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>고객지원</h4>
          <div className="footer-links">
            <Link to="/privacy">개인정보처리방침</Link>
            <Link to="/contact">문의하기</Link>
            <Link to="/boards">커뮤니티</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 DoRunning Project. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
