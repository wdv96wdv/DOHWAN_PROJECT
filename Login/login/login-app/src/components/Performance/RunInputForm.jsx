import React, { useState, useContext } from 'react';
import styles from '../../assets/css/common.module.css'; // CSS 모듈 import    
import { saveRunRecord } from '../../apis/performance';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';

const RunInputForm = ({ onRecordSaved }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    runningName: '', // 활동 제목
    date: getTodayStr(), // 오늘 날짜 기본값
    distanceKm: '',
    durationSec: '',
    calories: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo || !userInfo.no) {
      Swal.fire({
        title: '오류',
        text: '로그인 정보가 없습니다. 다시 로그인해주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }
    try {
      const res = await saveRunRecord(form); // userInfo.no 제거
      Swal.fire({
        title: '성공!',
        text: '러닝 기록이 저장되었습니다!',
        icon: 'success',
        confirmButtonText: '확인'
      });
      
      // 폼 초기화
      setForm({
        runningName: '',
        date: getTodayStr(),
        distanceKm: '',
        durationSec: '',
        calories: ''
      });
      
      // 부모 컴포넌트에 새로고침 알림
      if (onRecordSaved) {
        onRecordSaved();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: '오류',
        text: err.message || '저장에 실패했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>새 러닝 기록 입력</h2>
      <form onSubmit={handleSubmit}>
        <label>활동 제목</label>
        <input
          type="text"
          name="runningName"
          value={form.runningName}
          onChange={handleChange}
          className={styles.formInput}
          placeholder="예: 아침 러닝, 한강 질주 (미입력 시 자동 생성)"
        />

        <label>날짜</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className={styles.formInput}
          required
        />

        <label>거리 (km)</label>
        <input
          type="number"
          step="0.01"
          name="distanceKm"
          value={form.distanceKm}
          onChange={handleChange}
          className={styles.formInput}
          required
        />

        <label>시간 (초)</label>
        <input
          type="number"
          name="durationSec"
          value={form.durationSec}
          onChange={handleChange}
          className={styles.formInput}
          required
          placeholder="예: 1800 (30분)"
        />

        <label>칼로리 (kcal)</label>
        <input
          type="number"
          name="calories"
          value={form.calories}
          onChange={handleChange}
          className={styles.formInput}
          placeholder="선택사항"
        />

        <div className={styles.btnBox}>
          <button type="submit" className={styles.btn}>
            기록 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default RunInputForm;