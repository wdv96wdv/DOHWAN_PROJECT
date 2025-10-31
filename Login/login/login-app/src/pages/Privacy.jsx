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

      {/* 섹션 3: 문의 안내 */}
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
