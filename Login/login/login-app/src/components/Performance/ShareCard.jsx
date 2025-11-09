import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from '../../assets/css/common.module.css';

const ShareCard = ({ record }) => {
  const cardRef = useRef();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement('a');
    link.download = `run-card-${record.date}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };


  if (!record || !record.date) {
    return <p style={{ textAlign: 'center' }}>📭 공유 카드가 표시되지 않습니다. 데이터 확인 필요!</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📤 러닝 공유 카드</h2>
      <div ref={cardRef} style={{
        background: '#f0f4ff',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>🏃‍♂️ 러닝 요약</h3>
        <p>📅 날짜: {record.date}</p>
        <p>📏 거리: {record.distanceKm} km</p>
        <p>⏱️ 페이스: {record.paceMinPerKm.toFixed(2)} min/km</p>
        <p>🔥 칼로리: {record.calories} kcal</p>
      </div>

      <div className={styles.btnBox}>
        <button onClick={handleDownload} className={styles.btn}>저장</button>
      </div>
    </div>
  );
};

export default ShareCard;