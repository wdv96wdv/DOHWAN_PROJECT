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
            두러닝은 전국 마라톤·러닝 대회 일정을 모으고,
            신청 전에 필요한 정보를 한곳에서 확인하게 해 주는 러닝 허브입니다.
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
