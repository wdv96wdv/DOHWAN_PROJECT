import React, { useState } from 'react';
import styles from '../../assets/css/common.module.css';
import { saveRunRecord } from '../../apis/performance';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import Tesseract from 'tesseract.js';
import { Camera, Loader } from 'lucide-react';

const RunInputForm = ({ onRecordSaved }) => {
  const userInfo = useAuthStore(state => state.userInfo);

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    runningName: '',
    date: getTodayStr(),
    distanceKm: '',
    durationSec: '',
    calories: ''
  });

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- OCR 자동 입력 핸들러 ---
  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng+kor', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.floor(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      let extracted = {};

      // 거리 추출 (예: 5.23km, 10.0 km)
      const distMatch = text.match(/(\d+[\.,]\d+)\s*km/i) || text.match(/(\d+)\s*km/i);
      if (distMatch) {
        extracted.distanceKm = parseFloat(distMatch[1].replace(',', '.'));
      }

      // 시간 추출 (예: 25:14, 01:25:14)
      const timeMatch = text.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = timeMatch[1] ? parseInt(timeMatch[1], 10) : 0;
        const mins = parseInt(timeMatch[2], 10);
        const secs = parseInt(timeMatch[3], 10);
        extracted.durationSec = (hours * 3600) + (mins * 60) + secs;
      }

      if (Object.keys(extracted).length > 0) {
        setForm(prev => ({ ...prev, ...extracted }));
        Swal.fire({
          icon: 'success',
          title: '📸 OCR 자동 인식 완료!',
          html: `
            ${extracted.distanceKm ? `<b>거리:</b> ${extracted.distanceKm} km<br/>` : ''}
            ${extracted.durationSec ? `<b>시간:</b> ${Math.floor(extracted.durationSec / 60)}분 ${extracted.durationSec % 60}초` : ''}
            <br/><br/><small style="color:#aaa">인식이 정확하지 않으면 직접 수정해주세요.</small>
          `,
          confirmButtonText: '확인'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: '인식 실패',
          text: '이미지에서 거리나 시간을 찾지 못했습니다. 직접 입력해 주세요.',
          confirmButtonText: '확인'
        });
      }
    } catch (err) {
      console.error("OCR Error:", err);
      Swal.fire({ icon: 'error', title: 'OCR 오류', text: '이미지 분석 중 문제가 발생했습니다.' });
    } finally {
      setIsOcrLoading(false);
      // 같은 파일 재업로드를 위해 input 초기화
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo || !userInfo.no) {
      Swal.fire({ title: '오류', text: '로그인 정보가 없습니다. 다시 로그인해주세요.', icon: 'error', confirmButtonText: '확인' });
      return;
    }
    try {
      await saveRunRecord(form);
      Swal.fire({ title: '성공!', text: '러닝 기록이 저장되었습니다!', icon: 'success', confirmButtonText: '확인' });
      setForm({ runningName: '', date: getTodayStr(), distanceKm: '', durationSec: '', calories: '' });
      if (onRecordSaved) onRecordSaved();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: '오류', text: err.message || '저장에 실패했습니다.', icon: 'error', confirmButtonText: '확인' });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>새 러닝 기록 입력</h2>

      {/* OCR 자동입력 버튼 */}
      <div style={{
        marginBottom: '20px',
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1.5px dashed var(--primary)',
        background: 'hsla(220, 90%, 60%, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
            📸 이미지로 자동 입력
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            러닝 앱(나이키런, 스트라바 등) 결과 캡처를 업로드하면<br/>
            거리·시간이 자동으로 채워집니다.
          </div>
        </div>

        <label style={{
          cursor: isOcrLoading ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 18px', borderRadius: '8px',
          background: 'var(--primary)', color: '#fff',
          fontWeight: 600, fontSize: '0.9rem',
          opacity: isOcrLoading ? 0.7 : 1,
          whiteSpace: 'nowrap'
        }}>
          {isOcrLoading
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> 분석 중 {ocrProgress}%</>
            : <><Camera size={16} /> 이미지 업로드</>
          }
          <input
            type="file"
            accept="image/*"
            onChange={handleOcrUpload}
            disabled={isOcrLoading}
            style={{ display: 'none' }}
          />
        </label>

        {/* 진행바 */}
        {isOcrLoading && (
          <div style={{ width: '100%', height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${ocrProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label>활동 제목</label>
        <input type="text" name="runningName" value={form.runningName} onChange={handleChange}
          className={styles.formInput} placeholder="예: 아침 러닝, 한강 질주 (미입력 시 자동 생성)" />

        <label>날짜</label>
        <input type="date" name="date" value={form.date} onChange={handleChange}
          className={styles.formInput} required />

        <label>거리 (km)</label>
        <input type="number" step="0.01" name="distanceKm" value={form.distanceKm} onChange={handleChange}
          className={styles.formInput} required placeholder="이미지 업로드 시 자동 입력" />

        <label>시간 (초)</label>
        <input type="number" name="durationSec" value={form.durationSec} onChange={handleChange}
          className={styles.formInput} required placeholder="이미지 업로드 시 자동 입력 (예: 1800 = 30분)" />

        <label>칼로리 (kcal)</label>
        <input type="number" name="calories" value={form.calories} onChange={handleChange}
          className={styles.formInput} placeholder="선택사항" />

        <div className={styles.btnBox}>
          <button type="submit" className={styles.btn}>기록 저장</button>
        </div>
      </form>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RunInputForm;