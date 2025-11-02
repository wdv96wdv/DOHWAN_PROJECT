import React from 'react';
import styles from '../assets/css/common.module.css';

const Privacy = () => {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Privacy Policy</h1>

      {/* 섹션 1: 개인정보 수집 안내 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>개인정보 수집 안내</h2>
        <p className={styles.pageText}>
          DORunning은 회원 가입 시 최소한의 개인정보만 수집하며, 
          수집된 정보는 서비스 제공 목적 외에는 사용되지 않습니다.
        </p>
        <div className={styles.highlight}>
          수집 항목: 이름, 이메일, 사용자 ID, 마라톤 일정, 러닝 기록 및 코스 정보
        </div>
      </div>

      {/* 섹션 2: 개인정보 이용 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>개인정보 이용 목적</h2>
        <ul className={styles.pageText}>
          <li>✅ 회원 서비스 제공 및 계정 관리</li>
          <li>✅ 코스 및 이벤트 정보 제공</li>
          <li>✅ 마라톤 일정</li>
          <li>✅ 통계 및 서비스 개선</li>
        </ul>
      </div>

      {/* 섹션 3: 쿠키 정책 및 광고 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>쿠키 및 광고 정책</h2>
        <p className={styles.pageText}>
          본 웹사이트는 Google AdSense를 사용하여 광고를 제공합니다. 
          Google은 사용자의 방문 기록을 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.
        </p>
        <div className={styles.highlight}>
          <p><strong>쿠키 사용 목적:</strong></p>
          <ul>
            <li>광고 맞춤 설정 및 최적화</li>
            <li>광고 효과 측정 및 분석</li>
            <li>사용자 경험 개선</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            Google의 쿠키 사용 방식을 관리하거나 거부하려면{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google 광고 설정
            </a>을 방문하세요.
          </p>
          <p style={{ marginTop: '10px' }}>
            또한{' '}
            <a href="https://www.google.com/privacy/ads" target="_blank" rel="noopener noreferrer">
              Google 개인정보 보호 및 약관
            </a>에서 Google의 데이터 사용 방식을 자세히 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 섹션 4: 문의 안내 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>문의 및 요청</h2>
        <p className={styles.pageText}>
          개인정보 관련 문의, 삭제 요청, 수정 요청 등은 아래 페이지를 통해 연락주세요.
        </p>
        <p className={styles.pageText}>
          <a className={styles.pageLink} href="/contact">문의 페이지로 이동</a>
        </p>
      </div>
    </div>
  );
};

export default Privacy;
