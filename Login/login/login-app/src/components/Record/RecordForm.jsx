import React, { useState, useEffect } from "react";
import "../../assets/css/record.css";
import "../../assets/css/auth.css";
import { Clock, Calendar, Type, Route, Zap, Flame, AlignLeft } from 'lucide-react';

export default function RecordForm({ formData, setFormData, onSubmit, submitText }) {
  const [noteLength, setNoteLength] = useState(formData.note?.length || 0);

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

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setFormData((prev) => ({ ...prev, duration_sec: totalSeconds > 0 ? totalSeconds : "" }));
  }, [hours, minutes, seconds, setFormData]);

  useEffect(() => {
    const time = getTimeFromSeconds(formData.duration_sec);
    setHours(time.hours);
    setMinutes(time.minutes);
    setSeconds(time.seconds);
  }, [formData.duration_sec]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "note") setNoteLength(value.length);
    if (name === "pace_min_per_km") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateOptions = (max) =>
    Array.from({ length: max + 1 }, (_, i) => (
      <option key={i} value={i}>{i}</option>
    ));

  return (
    <div className="record-form-card">
      <form onSubmit={onSubmit} className="auth-form">
        <div className="record-form-grid">
          <div className="form-group">
            <label><Calendar size={14} /> 날짜 *</label>
            <input
              className="form-control"
              type="date"
              name="record_date"
              value={formData.record_date ? formData.record_date.slice(0, 10) : ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, record_date: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label><Type size={14} /> 활동 제목 *</label>
            <input
              className="form-control"
              type="text"
              name="running_name"
              value={formData.running_name || ""}
              placeholder="예: 아침 조깅, 한강 러닝"
              maxLength={100}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><Route size={14} /> 거리 (km)</label>
            <input
              className="form-control"
              type="number"
              name="distance_km"
              step="0.01"
              min="0"
              value={formData.distance_km || ""}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label><Clock size={14} /> 운동 시간</label>
            <div className="time-input-group">
              <select className="form-control time-field" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {generateOptions(9)}
              </select>
              <span>시</span>
              <select className="form-control time-field" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {generateOptions(59)}
              </select>
              <span>분</span>
              <select className="form-control time-field" value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
                {generateOptions(59)}
              </select>
              <span>초</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pace_min_per_km">페이스 (분/km)</label>
            <input
              className="form-control"
              type="text"
              name="pace_min_per_km"
              placeholder="예: 530 (5분 30초)"
              value={formData.pace_min_per_km ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label><Zap size={14} /> 케이던스 (spm)</label>
            <input
              className="form-control"
              type="number"
              name="cadence"
              value={formData.cadence ?? ""}
              onChange={handleChange}
              placeholder="170"
            />
          </div>

          <div className="form-group">
            <label><Flame size={14} /> 칼로리 (kcal)</label>
            <input
              className="form-control"
              type="number"
              name="calories"
              value={formData.calories ?? ""}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group record-form-full">
          <label><AlignLeft size={14} /> 메모</label>
          <textarea
            className="form-control"
            name="note"
            rows="3"
            placeholder="오늘의 러닝은 어땠나요? 컨디션이나 코스를 기록해보세요."
            maxLength={500}
            value={formData.note || ""}
            onChange={handleChange}
          />
          <div className="auth-footer" style={{ textAlign: 'right', marginTop: '4px' }}>
            {noteLength} / 500 자
          </div>
        </div>

        <button type="submit" className="btn-auth">
          {submitText}
        </button>
      </form>
    </div>
  );
}