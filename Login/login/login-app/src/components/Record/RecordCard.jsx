import React from "react";
import '../../assets/css/record.css';

export default function RecordCard({ record, onEdit, onDelete }) {
  return (
    <div className="record-card">
      <div className="record-header">
        <div>
          <div className="record-exercise">{record.exerciseName}</div>
          <div className="record-date">{new Date(record.createdAt).toLocaleString()}</div>
        </div>
        <div className="record-actions">
          <button className="btn-icon btn-edit" onClick={() => onEdit(record)}>수정</button>
          <button className="btn-icon btn-delete" onClick={() => onDelete(record.id)}>삭제</button>
        </div>
      </div>

      <div className="record-stats">
        {record.weight && (
          <div className="stat-item">
            <div className="stat-value">{record.weight}km</div>
            <div className="stat-label">거리</div>
          </div>
        )}
        {record.roundCount && (
          <div className="stat-item">
            <div className="stat-value">{record.roundCount}</div>
            <div className="stat-label">평균 페이스</div>
          </div>
        )}
        {record.reps && (
          <div className="stat-item">
            <div className="stat-value">{record.reps}</div>
            <div className="stat-label">케이던스</div>
          </div>
        )}
      </div>

      {record.note && <div className="record-note">{record.note}</div>}
    </div>
  );
}