import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Home, Calendar } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <Helmet>
        <title>404 - 페이지를 찾을 수 없습니다 | Dorunning</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '48px 32px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#ef4444'
        }}>
          <AlertCircle size={40} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
          404 - 페이지를 찾을 수 없습니다
        </h1>
        <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
          요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.<br />
          입력하신 주소를 다시 확인해 주세요.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'var(--primary, #1e88e5)',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Home size={18} /> 홈으로 이동
          </Link>
          <Link
            to="/marathon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'inherit',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={18} /> 마라톤 일정 보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
