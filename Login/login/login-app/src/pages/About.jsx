import React from 'react';
import runningImg from '../assets/img/aboutrunning.jpg'; 
import "../assets/css/info.css";
import "../assets/css/auth.css";
import { Info, Target, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="info-page">
      <header className="info-header">
        <h1>ABOUT <span style={{color: 'var(--primary)'}}>DORUNNING</span></h1>
        <p>Empowering runners to track, connect, and thrive.</p>
      </header>

      <div className="info-section">
        <h2><Info size={24} /> OUR MISSION</h2>
        <p className="info-text">
          DORunning is more than just a tracking app; it's a dedicated ecosystem for enthusiasts who live to run. 
          We provide a unified platform to manage your records, discover events, and connect with a community that shares your passion.
        </p>
        <div className="info-highlight">
          "Join thousands of runners in a journey towards better health and stronger connections."
        </div>
        <img src={runningImg} alt="Runners on track" className="info-image" />
      </div>

      <div className="info-section">
        <h2><Target size={24} /> CORE FEATURES</h2>
        <ul className="info-list">
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Smart Route Discovery:</strong> Explore curated courses optimized for your skill level.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Event Integration:</strong> Stay updated with global and local marathons and community runs.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Personalized Analytics:</strong> Visualize your progress with advanced performance tracking tools.</span>
          </li>
          <li>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Premium Experience:</strong> Enjoy a focus-driven interface designed for the modern runner.</span>
          </li>
        </ul>
      </div>

      <div className="info-section" style={{textAlign: 'center'}}>
        <h2><MessageCircle size={24} style={{margin: '0 auto'}} /> CONNECT WITH US</h2>
        <p className="info-text">Have suggestions or need support? Our team is always here to listen and evolve with you.</p>
        <a href="/contact" className="btn-auth" style={{display: 'inline-flex', padding: '12px 32px', marginTop: '16px'}}>
          GET IN TOUCH <ChevronRight size={18} style={{marginLeft: '8px'}} />
        </a>
      </div>
    </div>
  );
};

export default About;
