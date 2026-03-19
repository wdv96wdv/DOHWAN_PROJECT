import React from "react";
import "../../assets/css/record.css";
import dayjs from "dayjs";
import { Edit2, Trash2, MapPin, Watch, Zap, Flame, MoveRight } from "lucide-react";

const formatPace = (value) => {
  if (!value) return "-";
  const num = parseInt(value, 10);
  const minutes = Math.floor(num / 100);
  const seconds = num % 100;
  return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
};

const formatDuration = (seconds) => {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m ${seconds % 60}s`;
};

export default function RecordCard({ record, onEdit, onDelete }) {
  const recordDate = record.record_date ? dayjs(record.record_date).format("MMM D, YYYY") : "-";
  const updatedTime = record.record_date ? dayjs(record.record_date).format("HH:mm") : "";

  return (
    <div className="record-card">
      <div className="record-card-header">
        <div className="record-title-group">
          <h3>{record.running_name}</h3>
          <div className="record-meta">
            {recordDate} {updatedTime && `• ${updatedTime}`}
          </div>
        </div>

        <div className="record-actions">
          <button className="btn-icon" onClick={() => onEdit(record)} title="Edit">
            <Edit2 size={16} />
          </button>
          <button className="btn-icon delete" onClick={() => onDelete(record.id)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="record-stats-grid">
        <div className="stat-box">
          <div className="stat-label">Distance</div>
          <div className="stat-value">{record.distance_km || "0.00"} <small>km</small></div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Duration</div>
          <div className="stat-value">{formatDuration(record.duration_sec)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Pace</div>
          <div className="stat-value">{formatPace(record.pace_min_per_km)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Energy</div>
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
