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
          <h4>Platform</h4>
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/marathon">Marathon</Link>
            <Link to="/course">Courses</Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/boards">Community</Link>
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
