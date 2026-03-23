import React from "react";
import "../../assets/css/record.css";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // ✅ 한글 로케일 추가
import { Edit2, Trash2 } from "lucide-react";

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
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}시간 ${minutes % 60}분`; // ✅ 한글화
  return `${minutes}분 ${seconds % 60}초`; // ✅ 한글화
};

export default function RecordCard({ record, onEdit, onDelete }) {
  // 날짜 형식 변경 (예: 2026년 3월 23일)
  const recordDate = record.record_date ? dayjs(record.record_date).locale('ko').format("YYYY년 M월 D일") : "-";
  const updatedTime = record.record_date ? dayjs(record.record_date).format("HH:mm") : "";

  return (
    <div className="record-card">
      <div className="record-card-header">
        <div className="record-title-group">
          <h3>{record.running_name}</h3>
          <div className="record-meta">
            {recordDate} {updatedTime && ` • ${updatedTime}`}
          </div>
        </div>

        <div className="record-actions">
          <button className="btn-icon" onClick={() => onEdit(record)} title="수정">
            <Edit2 size={16} />
          </button>
          <button className="btn-icon delete" onClick={() => onDelete(record.id)} title="삭제">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="record-stats-grid">
        <div className="stat-box">
          <div className="stat-label">거리</div>
          <div className="stat-value">{record.distance_km || "0.00"} <small>km</small></div>
        </div>
        <div className="stat-box">
          <div className="stat-label">시간</div>
          <div className="stat-value">{formatDuration(record.duration_sec)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">페이스</div>
          <div className="stat-value">{formatPace(record.pace_min_per_km)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">소모 칼로리</div>
          <div className="stat-value">{record.calories || "0"} <small>kcal</small></div>
        </div>
      </div>

      {record.note && (
        <div className="record-note">
          {record.note}
        </div>
      )}
    </div>
  );
}