import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import "../../assets/css/performance.css";
import { Share2, Download, Trophy, RotateCw } from 'lucide-react';

const THEMES = [
  {
    name: 'Neon Night',
    bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    accent: '#00f2fe',
    text: '#ffffff'
  },
  {
    name: 'Sunset Dash',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: '#ffd700',
    text: '#ffffff'
  },
  {
    name: 'Emerald Pro',
    bg: 'linear-gradient(135deg, #134e5e, #71b280)',
    accent: '#a8ff78',
    text: '#ffffff'
  },
  {
    name: 'Cyberpunk',
    bg: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
    accent: '#00d2ff',
    text: '#ffffff'
  },
  {
    name: 'Minimal Dark',
    bg: 'linear-gradient(135deg, #232526, #414345)',
    accent: '#var(--primary)',
    text: '#ffffff'
  }
];

const ShareCard = ({ record }) => {
  const cardRef = useRef();
  const [theme, setTheme] = useState(THEMES[0]);

  useEffect(() => {
    // 마운트 시 랜덤 테마 설정
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    setTheme(randomTheme);
  }, []);

  const changeTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `dorunning-${record?.date?.split(' ')[0] || 'share'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 모바일 공유 API 시도
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Run Record',
          text: 'Check out my run on DoRunning!'
        });
      } else {
        // 데스크탑 또는 지원하지 않는 브라우저: 기존 다운로드 방식
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        
        // 모바일인 경우 알림 추가
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
          Swal.fire({
            title: "저장 완료",
            text: "파일이 다운로드되었습니다. 갤러리에서 보이지 않는다면 '파일' 앱 또는 '다운로드' 폴더를 확인해주세요.",
            icon: "info"
          });
        }
      }
    } catch (err) {
      console.error("Export error:", err);
      Swal.fire("오류", "이미지 생성 중 오류가 발생했습니다.", "error");
    }
  };

  if (!record) return null;

  return (
    <div className="widget-card status-card-widget">
      <div className="status-header">
        <div className="status-title">
          <Share2 size={18} className="icon-primary" />
          <span>STATUS CARD</span>
        </div>
        <button className="btn-icon" onClick={changeTheme} title="Change Theme">
          <RotateCw size={16} />
        </button>
      </div>
      
      <div className="card-preview-container">
        <div ref={cardRef} className="insta-card" style={{ background: theme.bg }}>
          <div className="card-overlay-decor">
            <Trophy size={150} />
          </div>
          
          <div className="card-top">
            <span className="app-brand">DORUNNING PRO</span>
            <span className="theme-name">{theme.name}</span>
          </div>

          <div className="card-main">
            <div className="activity-type">{record.runningName || 'RUNNING'}</div>
            <div className="main-stat-row">
              <div className="stat-box">
                <span className="label">DISTANCE</span>
                <span className="value">{record.distanceKm || '0'}<small>KM</small></span>
              </div>
            </div>
            
            <div className="secondary-stats">
              <div className="stat-item">
                <span className="label">PACE</span>
                <span className="value">{record.paceMinPerKm?.toFixed(2) || '-'}</span>
              </div>
              <div className="stat-item">
                <span className="label">KCAL</span>
                <span className="value">{record.calories || '-'}</span>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="date">{record.date}</div>
            <div className="hash-tag">#DORUNNING #RUNNER</div>
          </div>
        </div>
      </div>

      <button onClick={handleDownload} className="btn-auth share-btn">
        <Download size={16} /> EXPORT FOR INSTAGRAM
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .status-card-widget {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .card-preview-container {
          padding: 10px 0;
          display: flex;
          justify-content: center;
        }
        
        .insta-card {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 4/5;
          border-radius: 20px;
          padding: 30px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .card-overlay-decor {
          position: absolute;
          top: -20px;
          right: -20px;
          opacity: 0.1;
          transform: rotate(15deg);
        }
        
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1;
        }
        .app-brand {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          opacity: 0.9;
        }
        .theme-name {
          font-size: 0.6rem;
          opacity: 0.5;
          text-transform: uppercase;
        }
        
        .card-main {
          text-align: center;
          z-index: 1;
        }
        .activity-type {
          font-size: 0.9rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          margin-bottom: 20px;
          opacity: 0.8;
          text-transform: uppercase;
        }
        
        .main-stat-row {
          margin-bottom: 30px;
        }
        .main-stat-row .value {
          font-family: 'Orbitron', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          display: block;
          line-height: 1;
        }
        .main-stat-row .value small {
          font-size: 1rem;
          margin-left: 4px;
        }
        .main-stat-row .label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          opacity: 0.7;
        }
        
        .secondary-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 20px;
        }
        .stat-item .value {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          display: block;
        }
        .stat-item .label {
          font-size: 0.6rem;
          opacity: 0.6;
          letter-spacing: 0.1em;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          z-index: 1;
        }
        .card-footer .date {
          font-size: 0.7rem;
          opacity: 0.6;
        }
        .hash-tag {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.55rem;
          opacity: 0.4;
        }
        
        .share-btn {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}} />
    </div>
  );
};

export default ShareCard;