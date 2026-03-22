import React from 'react';
import "../assets/css/info.css";
import "../assets/css/auth.css";
import { ShieldCheck, Eye, Lock, Mail, ExternalLink, Activity } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="info-page">
      <header className="info-header">
        <h1>개인정보 <span style={{color: 'var(--primary)'}}>처리방침</span></h1>
        <p>여러분의 신뢰는 두러닝의 가장 소중한 자산입니다.</p>
      </header>

      <div className="info-section">
        <h2><ShieldCheck size={24} /> 데이터 수집 안내</h2>
        <p className="info-text">
          두러닝은 사용자의 개인정보를 소중히 여깁니다. 개인화된 러닝 경험을 제공하기 위해 필요한 최소한의 정보만을 수집합니다. 
          귀하의 데이터는 명시적인 동의 없이 마케팅 목적으로 제3자에게 공유되지 않습니다.
        </p>
        <div className="info-highlight">
          <strong>수집하는 정보:</strong> 이름, 이메일, 아이디, 러닝 기록, 마라톤 일정 및 코스 선호도.
        </div>
      </div>

      <div className="info-section">
        <h2><Eye size={24} /> 데이터 활용 목적</h2>
        <ul className="info-list">
          <li style={{marginBottom: '20px'}}>
            <Lock size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>계정 관리:</strong> 프로필 및 기록에 대한 안전한 접근을 보장합니다.
            </div>
          </li>
          <li style={{marginBottom: '20px'}}>
            <ShieldCheck size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>서비스 최적화:</strong> 사용자의 기록에 맞춘 경로 추천 및 이벤트 알림을 제공합니다.
            </div>
          </li>
          <li style={{marginBottom: '20px'}}>
            <Activity size={18} color="var(--primary)" style={{marginTop: '4px'}} />
            <div>
              <strong>기록 분석:</strong> 수집된 데이터를 분석하여 러너로서의 성장을 시각화해 드립니다.
            </div>
          </li>
        </ul>
      </div>

      <div className="info-section">
        <h2><ExternalLink size={24} /> 쿠키 및 광고 안내</h2>
        <p className="info-text">
          본 웹사이트는 관련성 높은 광고를 제공하기 위해 Google AdSense를 사용합니다. 
          Google은 쿠키를 사용하여 본 사이트 및 인터넷상의 다른 사이트 방문 기록을 바탕으로 광고를 게재할 수 있습니다.
        </p>
        <div className="info-highlight" style={{background: 'rgba(255,255,255,0.03)', borderLeftColor: 'var(--text-muted)'}}>
          <p style={{marginBottom: '10px'}}><strong>광고 설정 관리:</strong></p>
          <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="btn-auth secondary" style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              구글 광고 설정
            </a>
            <a href="https://www.google.com/privacy/ads" target="_blank" rel="noopener noreferrer" className="btn-auth secondary" style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              구글 개인정보 보호 및 약관
            </a>
          </div>
        </div>
      </div>

      <div className="info-section" style={{textAlign: 'center'}}>
        <h2><Mail size={24} style={{margin: '0 auto'}} /> 문의하기</h2>
        <p className="info-text">본 방침에 대해 궁금한 점이 있거나 데이터 삭제를 요청하시려면 언제든 문의해 주세요.</p>
        <a href="/contact" className="btn-auth" style={{display: 'inline-flex', padding: '12px 32px'}}>고객 지원 문의</a>
      </div>
    </div>
  );
};

export default Privacy;
