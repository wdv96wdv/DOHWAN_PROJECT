import React from "react";
import "../../assets/css/record.css";
import RecordCard from "./RecordCard";
import { FolderOpen } from "lucide-react";

export default function RecordList({ records, onEdit, onDelete }) {
  if (!records || records.length === 0) {
    return (
      <div className="records-container" style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
        <FolderOpen size={48} style={{ margin: '0 auto 16px' }} />
        <h3>아직 저장된 기록이 없어요.</h3>
        <p>위의 양식을 작성해 첫 번째 활동을 기록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="records-container">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}