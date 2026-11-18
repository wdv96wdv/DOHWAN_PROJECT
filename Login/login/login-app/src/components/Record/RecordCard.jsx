// src/components/Record/RecordCard.jsx
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { Edit2, Trash2, Calendar, Flame, Zap, Gauge, MessageSquare } from "lucide-react";
import "../../assets/css/record.css";

// 페이스 포맷 (530 -> 5'30'')
const formatPace = (value) => {
  if (!value) return "-";
  const num = parseInt(value, 10);
  const minutes = Math.floor(num / 100);
  const seconds = num % 100;
  return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
};

// 운동 시간 포맷 (초 -> 시간/분/초)
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "-";
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  const remainSecs = seconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${remainMins}분 ${remainSecs > 0 ? `${remainSecs}초` : ''}`;
  }
  return `${remainMins}분 ${remainSecs}초`;
};

export default function RecordCard({ record, onEdit, onDelete }) {
  // 날짜 형식
  const dateObj = record.record_date ? dayjs(record.record_date).locale('ko') : null;
  const formattedDate = dateObj ? dateObj.format("YYYY.MM.DD (ddd) HH:mm") : "-";

  return (
    <article className="record-card">
      {/* Header */}
      <div className="record-card-header">
        <div className="record-title-group">
          <h3>{record.running_name || "러닝 활동"}</h3>
          <span className="record-meta">
            <Calendar size={13} /> {formattedDate}
          </span>
        </div>

        <div className="record-actions">
          <button 
            type="button" 
            className="btn-icon" 
            onClick={() => onEdit(record)} 
            title="기록 수정"
          >
            <Edit2 size={15} />
          </button>
          <button 
            type="button" 
            className="btn-icon delete" 
            onClick={() => onDelete(record.id)} 
            title="기록 삭제"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Hero 3-Stats Grid */}
      <div className="record-hero-stats">
        <div className="record-hero-stat-item primary">
          <span className="stat-label">거리</span>
          <div className="stat-value">
            {record.distance_km != null ? Number(record.distance_km).toFixed(2) : "0.00"}
            <small>km</small>
          </div>
        </div>

        <div className="record-hero-stat-item">
          <span className="stat-label">시간</span>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {formatDuration(record.duration_sec)}
          </div>
        </div>

        <div className="record-hero-stat-item">
          <span className="stat-label">평균 페이스</span>
          <div className="stat-value">
            {formatPace(record.pace_min_per_km)}
            <small style={{ fontSize: '0.72rem' }}>/km</small>
          </div>
        </div>
      </div>

      {/* Secondary Chips */}
      <div className="record-chips-bar">
        {record.calories > 0 && (
          <span className="record-chip" title="소모 칼로리">
            <Flame size={13} style={{ color: '#ea580c' }} /> {record.calories} kcal
          </span>
        )}
        {record.cadence > 0 && (
          <span className="record-chip" title="평균 케이던스">
            <Zap size={13} style={{ color: '#2563eb' }} /> {record.cadence} spm
          </span>
        )}
        {record.speed_kmh > 0 && (
          <span className="record-chip" title="평균 속도">
            <Gauge size={13} style={{ color: '#059669' }} /> {Number(record.speed_kmh).toFixed(1)} km/h
          </span>
        )}
      </div>

      {/* Note */}
      {record.note && (
        <div className="record-note">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
            <MessageSquare size={12} /> 러너의 한줄 메모
          </div>
          <div>{record.note}</div>
        </div>
      )}
    </article>
  );
}
