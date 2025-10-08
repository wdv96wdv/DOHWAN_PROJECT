// src/components/Footer/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import '../../assets/css/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          © 2025 Dohwan Project. All rights reserved.
        </p>
        <div className="footer-links">
          <Link to="/about" aria-label="About page">About</Link>
          <Link to="/privacy" aria-label="Privacy policy">Privacy</Link>
          <Link to="/contact" aria-label="Contact page">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
