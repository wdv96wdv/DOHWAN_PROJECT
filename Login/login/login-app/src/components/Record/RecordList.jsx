import React from "react";
import common from "../../assets/css/common.module.css";
import styles from "../../assets/css/record.module.css";
import RecordCard from "./RecordCard";

export default function RecordList({ records, onEdit, onDelete }) {
  if (!records || records.length === 0) {
    return (
      <div className={styles.recordsGrid} style={{ padding: 16 }}>
        <div className={styles.emptyState}>
          <h3 className={common.title}>러닝 기록이 없습니다.</h3>
          <p className={common.pageText}>첫 번째 러닝 기록을 추가해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recordsGrid}>
      {records.map((record) => (
        <RecordCard key={record.id} record={record} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
