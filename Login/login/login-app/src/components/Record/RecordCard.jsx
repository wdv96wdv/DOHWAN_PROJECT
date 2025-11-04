import React from "react";
import common from "../../assets/css/common.module.css";
import styles from "../../assets/css/record.module.css";
import dayjs from "dayjs";

// 페이스 포맷 함수: 547 -> "5'47''"
const formatPace = (value) => {
  if (!value) return "-";
  if (isNaN(value)) return value;
  const num = parseInt(value, 10);
  const minutes = Math.floor(num / 100);
  const seconds = num % 100;
  return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
};

// 시간 포맷 함수: 1800초 -> "30분"
const formatDuration = (seconds) => {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  }
  return `${minutes}분`;
};

export default function RecordCard({ record, onEdit, onDelete }) {
  const formattedDate = dayjs(record.created_at).format("YYYY-MM-DD HH:mm");

  return (
    <div className={styles.recordCard}>
      <div className={styles.recordHeader}>
        <div>
          <div className={common.subtitle}>{record.running_name}</div>
          <div className={styles.recordDate}>{formattedDate}</div>
        </div>

        <div className={styles.recordActions}>
          <button className={`${common.btnGray}`} onClick={() => onEdit(record)}>
            수정
          </button>
          <button className={`${common.btnGray}`} onClick={() => onDelete(record.id)}>
            삭제
          </button>
        </div>
      </div>

      <div className={styles.recordStats}>
        {record.distance_km && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{record.distance_km} km</div>
            <div className={styles.statLabel}>거리</div>
          </div>
        )}
        {record.duration_sec && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{formatDuration(record.duration_sec)}</div>
            <div className={styles.statLabel}>시간</div>
          </div>
        )}
        {record.pace_min_per_km && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{formatPace(record.pace_min_per_km)}</div>
            <div className={styles.statLabel}>평균 페이스</div>
          </div>
        )}
        {record.speed_kmh && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{record.speed_kmh.toFixed(2)} km/h</div>
            <div className={styles.statLabel}>속도</div>
          </div>
        )}
        {record.cadence && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{record.cadence}</div>
            <div className={styles.statLabel}>케이던스</div>
          </div>
        )}
        {record.calories && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{record.calories} kcal</div>
            <div className={styles.statLabel}>칼로리</div>
          </div>
        )}
      </div>

      {record.note && <div className={common.pageText} style={{ marginTop: 10 }}>{record.note}</div>}
    </div>
  );
}
