import React, { useState } from 'react';
import styles from '../assets/css/common.module.css';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          message: e.target.message.value
        })
      });

      if (response.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 메시지가 변경될 때마다 글자 수 업데이트
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Contact Us</h1>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>문의 양식</h2>
        {success ? (
          <div className={styles.highlight}>
            문의가 성공적으로 접수되었습니다! 감사합니다.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              className={styles.formInput}
              type="text"
              name="name"
              placeholder="이름"
              required
            />
            <input
              className={styles.formInput}
              type="email"
              name="email"
              placeholder="이메일"
              required
            />
            <textarea
              className={styles.formTextarea}
              name="message"
              placeholder="문의 내용"
              rows="5"
              required
              maxLength={500}
              onChange={handleMessageChange} // 입력값 변경 시 상태 업데이트
            />
             <div className={styles.charCount}>
              글자 수: {message.length} / 500 {/* 글자 수와 최대 글자 수 표시 */}
            </div>
            <div className={styles.btnBox}>
              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? '전송 중...' : '전송'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>연락처</h2>
        <p className={styles.pageText}>이메일: kimdohwan969@gmail.com</p>
        <p className={styles.pageText}>전화: 010-4426-9958</p>
      </div>
    </div>
  );
};

export default Contact;
