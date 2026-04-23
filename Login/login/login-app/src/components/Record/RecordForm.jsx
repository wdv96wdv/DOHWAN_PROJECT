import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/record.css";
import "../../assets/css/auth.css";
import { Clock, Calendar, Type, Route, Zap, Flame, AlignLeft, Camera, Loader2 } from 'lucide-react';
import { processNRCImage } from "../../utils/ocrService";
import Swal from "sweetalert2";

export default function RecordForm({ formData, setFormData, onSubmit, submitText }) {
  const [noteLength, setNoteLength] = useState(formData.note?.length || 0);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  // 시간 문자열 (HH:MM:SS)을 초 단위로 변환
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  // 페이스 문자열 (M'SS")을 포맷 (MSS)으로 변환
  const parsePaceToFormat = (paceStr) => {
    if (!paceStr) return "";
    const match = paceStr.match(/(\d+)[':](\d+)/);
    if (match) return match[1] + match[2].padStart(2, '0');
    return "";
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const data = await processNRCImage(file);
      
      // 인식 결과에 따른 처리
      if (data.matchQuality === "low") {
        const hasAnyData = data.distance_km || data.duration || data.pace;
        
        if (hasAnyData) {
          const result = await Swal.fire({
            title: "형식 불분명",
            text: "나이키 런 스크린샷 형식인지 확실하지 않지만 일부 데이터를 찾았습니다. 그래도 데이터를 입력창에 채울까요?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#aaa",
            confirmButtonText: "예, 채워주세요",
            cancelButtonText: "아니오"
          });
          if (!result.isConfirmed) return;
        } else {
          Swal.fire({
            title: "인식 불가",
            text: "사진에서 운동 데이터를 찾을 수 없습니다. 직접 입력하시거나 다른 사진을 선택해주세요.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "확인"
          });
          return;
        }
      }
      
      const newDurationSeconds = parseTimeToSeconds(data.duration);
      const newPace = parsePaceToFormat(data.pace);

      setFormData(prev => ({
        ...prev,
        running_name: data.running_name || ("NRC Run - " + (data.record_date || new Date().toLocaleDateString())),
        distance_km: data.distance_km || prev.distance_km,
        duration_sec: newDurationSeconds || prev.duration_sec,
        pace_min_per_km: newPace || prev.pace_min_per_km,
        calories: data.calories || prev.calories,
        cadence: data.cadence || prev.cadence,
        record_date: data.record_date || prev.record_date,
      }));

      Swal.fire({
        title: "인식 완료!",
        text: "나이키 런 데이터를 성공적으로 추출했습니다. 입력된 내용을 확인해주세요.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire("인식 실패", "사진에서 데이터를 읽어오지 못했습니다. 직접 입력해주세요.", "error");
    } finally {
      setIsOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      {isOcrLoading && (
        <div className="ocr-loading-overlay">
          <Loader2 className="spinner" size={48} />
          <p>나이키 런 데이터를 분석 중입니다...</p>
        </div>
      )}
      
      <div className="nrc-upload-section">
        <button 
          type="button" 
          className="btn-nrc-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={20} />
          <span>나이키 런 사진으로 자동 입력</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="record-form-grid">
          <div className="form-group">
            <label><Calendar size={14} /> 날짜 및 시간 *</label>
            <input
              className="form-control"
              type="datetime-local"
              name="record_date"
              value={formData.record_date ? (formData.record_date.length === 10 ? `${formData.record_date}T00:00` : formData.record_date.slice(0, 16)) : ""}
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