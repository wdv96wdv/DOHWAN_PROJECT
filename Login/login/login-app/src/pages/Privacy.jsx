import React from 'react';
import "../assets/css/info.css";
import "../assets/css/auth.css";
import { ShieldCheck, Eye, Lock, Mail, ExternalLink } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="info-page">
      <header className="info-header">
        <h1>PRIVACY <span style={{color: 'var(--primary)'}}>POLICY</span></h1>
        <p>Your trust is our most valuable asset.</p>
      </header>

      <div className="info-section">
        <h2><ShieldCheck size={24} /> DATA COLLECTION</h2>
        <p className="info-text">
          DORunning values your privacy. We collect only the essential information required to provide a personalized running experience. 
          Your data is never shared with third parties for marketing purposes without your explicit consent.
        </p>
        <div className="info-highlight">
          <strong>Information we collect:</strong> Name, Email, Username, Running Records, Marathon Schedules, and Course Preferences.
        </div>
      </div>

      <div className="info-section">
        <h2><Eye size={24} /> HOW WE USE YOUR DATA</h2>
        <ul className="info-list">
          <li style={{marginBottom: '20px'}}>
            <Lock size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>Account Management:</strong> Ensuring secure access to your profile and records.
            </div>
          </li>
          <li style={{marginBottom: '20px'}}>
            <ShieldCheck size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>Service Optimization:</strong> Tailoring route recommendations and event notifications to your performance.
            </div>
          </li>
          <li style={{marginBottom: '20px'}}>
            <Activity size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>Performance Analytics:</strong> Aggregating data to help you visualize your growth as a runner.
            </div>
          </li>
        </ul>
      </div>

      <div className="info-section">
        <h2><ExternalLink size={24} /> COOKIES & ADVERTISING</h2>
        <p className="info-text">
          Our website utilizes Google AdSense to serve relevant advertisements. 
          Google may use cookies to serve ads based on your visits to this and other websites on the Internet.
        </p>
        <div className="info-highlight" style={{background: 'rgba(255,255,255,0.03)', borderLeftColor: 'var(--text-muted)'}}>
          <p style={{marginBottom: '10px'}}><strong>Manage Preferences:</strong></p>
          <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="btn-auth secondary" style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              GOOGLE AD SETTINGS
            </a>
            <a href="https://www.google.com/privacy/ads" target="_blank" rel="noopener noreferrer" className="btn-auth secondary" style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              GOOGLE PRIVACY & TERMS
            </a>
          </div>
        </div>
      </div>

      <div className="info-section" style={{textAlign: 'center'}}>
        <h2><Mail size={24} style={{margin: '0 auto'}} /> INQUIRIES</h2>
        <p className="info-text">If you have any questions about this policy or want to request data deletion, please contact us.</p>
        <a href="/contact" className="btn-auth" style={{display: 'inline-flex', padding: '12px 32px'}}>CONTACT SUPPORT</a>
      </div>
    </div>
  );
};

export default Privacy;
