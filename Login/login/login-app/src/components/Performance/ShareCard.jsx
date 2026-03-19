import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import "../../assets/css/performance.css";
import { Share2, Download, Trophy } from 'lucide-react';

const ShareCard = ({ record }) => {
  const cardRef = useRef();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `dorunning-${record?.date || 'share'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!record) return null;

  return (
    <div className="widget-card">
      <h3><Share2 size={18} /> STATUS CARD</h3>
      
      <div ref={cardRef} style={{
        padding: '24px',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Trophy size={120} />
        </div>
        <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', opacity: 0.8, letterSpacing: '0.2em' }}>DORUNNING PRO</div>
        <h4 style={{ margin: '12px 0', fontSize: '1.2rem' }}>LAST ACTIVITY</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
          <div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>DISTANCE</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem' }}>{record.distanceKm || '0'} KM</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>PACE</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem' }}>{record.paceMinPerKm?.toFixed(2) || '-'}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{record.date}</div>
      </div>

      <button onClick={handleDownload} className="btn-auth" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
        <Download size={16} /> EXPORT IMAGE
      </button>
    </div>
  );
};

export default ShareCard;