import React from "react";
import "../../assets/css/record.css";
import RecordCard from "./RecordCard";

export default function RecordList({ records, onEdit, onDelete }) {
  if (!records.length) {
    return (
      <div className="empty-state">
        <h3>러닝 기록이 없습니다.</h3>
        <p>첫 번째 러닝 기록을 추가해보세요!</p>
      </div>
    );
  }

  // DB 숫자를 화면용 포맷으로 변환
  const formatPace = (value) => {
    if (!value) return "-";
    if (isNaN(value)) return value;
    const num = parseInt(value, 10);
    const minutes = Math.floor(num / 100);
    const seconds = num % 100;
    return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
  };

  return (
    <div className="records-grid">
      {records.map(record => {
        const formattedRecord = {
          ...record,
          round_count_display: formatPace(record.round_count), // 화면용 필드
          created_at: new Date(record.created_at).toLocaleString(),
        };
        return (
          <RecordCard
            key={record.id}
            record={formattedRecord}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}
