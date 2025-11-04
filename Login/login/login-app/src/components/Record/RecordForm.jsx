import React, { useState, useEffect } from "react";
import common from "../../assets/css/common.module.css";
import styles from "../../assets/css/record.module.css";

export default function RecordForm({ formData, setFormData, onSubmit, submitText }) {
  const [noteLength, setNoteLength] = useState(formData.note?.length || 0);

  // duration_sec -> 시/분/초 분해
  const getTimeFromSeconds = (totalSeconds) => {
    if (!totalSeconds) return { hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const initialTime = getTimeFromSeconds(formData.duration_sec);
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [seconds, setSeconds] = useState(initialTime.seconds);

  // 시/분/초 변경 시 duration_sec 업데이트
  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setFormData((prev) => ({ ...prev, duration_sec: totalSeconds > 0 ? totalSeconds : "" }));
  }, [hours, minutes, seconds, setFormData]);

  // 외부에서 duration_sec가 바뀌면 시/분/초 동기화
  useEffect(() => {
    const time = getTimeFromSeconds(formData.duration_sec);
    setHours(time.hours);
    setMinutes(time.minutes);
    setSeconds(time.seconds);
  }, [formData.duration_sec]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "note") {
      setNoteLength(value.length);
    }

    if (name === "pace_min_per_km") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateOptions = (max) =>
    Array.from({ length: max + 1 }, (_, i) => (
      <option key={i} value={i}>
        {i}
      </option>
    ));

  return (
    <div className={styles.inputSection}>
      <h2 className={common.title}>러닝 기록 입력</h2>

      <form onSubmit={onSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="created_at">날짜 *</label>
            <input
              className={common.formInput}
              type="date"
              id="created_at"
              name="created_at"
              value={(formData.created_at || "").toString().slice(0, 10)}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="running_name">러닝 제목 *</label>
            <input
              className={common.formInput}
              type="text"
              id="running_name"
              name="running_name"
              value={formData.running_name || ""}
              placeholder="예: 아침 러닝, 저녁 5km 러닝"
              maxLength={100}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="distance_km">거리 (km)</label>
            <input
              className={common.formInput}
              type="number"
              id="distance_km"
              name="distance_km"
              step="0.01"
              min="0"
              value={formData.distance_km || ""}
              onChange={handleChange}
              placeholder="예: 5.2"
            />
          </div>

          <div className={styles.formGroup}>
            <label>운동 시간</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value, 10))}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "14px", flex: 1 }}
              >
                {generateOptions(5)}
              </select>
              <span>시간</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "14px", flex: 1 }}
              >
                {generateOptions(59)}
              </select>
              <span>분</span>
              <select
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value, 10))}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "14px", flex: 1 }}
              >
                {generateOptions(59)}
              </select>
              <span>초</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pace_min_per_km">평균 페이스 (분/km)</label>
            <input
              className={common.formInput}
              type="text"
              id="pace_min_per_km"
              name="pace_min_per_km"
              placeholder="예: 547 (5분 47초)"
              value={formData.pace_min_per_km ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cadence">케이던스 (보/분)</label>
            <input
              className={common.formInput}
              type="number"
              id="cadence"
              name="cadence"
              min="1"
              max="300"
              value={formData.cadence ?? ""}
              onChange={handleChange}
              placeholder="예: 170"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="calories">칼로리 (kcal)</label>
            <input
              className={common.formInput}
              type="number"
              id="calories"
              name="calories"
              min="0"
              value={formData.calories ?? ""}
              onChange={handleChange}
              placeholder="예: 300"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="note">메모</label>
          <textarea
            className={common.formTextarea}
            id="note"
            name="note"
            placeholder="러닝에 대한 추가 메모를 입력해주세요.."
            maxLength={500}
            value={formData.note || ""}
            onChange={handleChange}
          />
          <div className={common.charCount}>
            <span>{noteLength} / 500</span>
          </div>
        </div>

        <div className={common.btnBox} style={{ marginTop: 12 }}>
          <button type="submit" className={common.btn}>
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}
