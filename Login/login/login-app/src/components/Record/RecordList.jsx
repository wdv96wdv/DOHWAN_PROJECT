import React from "react";
import '../../assets/css/record.css';
import RecordCard from "./RecordCard";

export default function RecordList({ records, onEdit, onDelete }) {
  if (!records.length) {
    return (
      <div className="empty-state">
        <h3>런닝 기록이 없습니다.</h3>
        <p>첫 번째 런닝 기록을 추가해보세요!</p>
      </div>
    );
  }

  // ✅ 평균페이스 포맷 함수
  const formatPace = (value) => {
    if (!value) return "-";
    if (isNaN(value)) return value;

    let num = parseInt(value, 10);
    let minutes = Math.floor(num / 100);
    let seconds = num % 100;

    // 60초 넘으면 분 단위 보정
    if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
    }

    return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
  };

  return (
    <div className="records-grid">
      {records.map((record) => {
        // ✅ record 복사 후 pace만 포맷
        const formattedRecord = {
          ...record,
          roundCount: formatPace(record.roundCount),
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
