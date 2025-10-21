import React from 'react';
import styles from '../assets/css/common.module.css';
import runningImg from '../assets/img/aboutrunning.jpg'; 

const About = () => {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>About DORunning</h1>

      {/* 섹션 1: 서비스 소개 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>서비스 소개</h2>
        <p className={styles.pageText}>
          DORunning은 러닝을 사랑하는 사람들을 위한 커뮤니티입니다. 
          회원가입을 통해 코스 정보, 이벤트, 러닝 기록 등을 관리하고 공유할 수 있습니다.
        </p>
        <div className={styles.highlight}>
          누구나 쉽게 러닝 기록을 관리하고, 다양한 코스와 이벤트 정보를 한 눈에 확인할 수 있습니다.
        </div>
        <img src={runningImg} alt="Running" className={styles.pageImage} />
      </div>

      {/* 섹션 2: 특징 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>주요 특징</h2>
        <ul className={styles.pageText}>
          <li>✅ 다양한 러닝 코스 정보 제공</li>
          <li>✅ 러닝 이벤트 참여 및 기록 공유</li>
          <li>✅ PC 환경에서 편리하게 회원가입 및 기록 관리</li>
        </ul>
      </div>

      {/* 섹션 3: 문의 안내 */}
      <div className={styles.section}>
        <h2 className={styles.subtitle}>문의 안내</h2>
        <p className={styles.pageText}>
          사이트 관련 문의나 개선 요청은 언제든지 아래 페이지를 통해 연락주세요.
        </p>
        <p className={styles.pageText}>
          <a className={styles.pageLink} href="/contact">문의 페이지로 이동</a>
        </p>
      </div>
    </div>
  );
};

export default About;
