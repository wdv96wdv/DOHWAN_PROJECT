import React, { useEffect, useState } from 'react';
import { getRunRecords } from '../../apis/performance';
import styles from '../../assets/css/common.module.css';

const RunRecordList = ({ refreshKey = 0 }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getRunRecords()
      .then((res) => setRecords(res.data || []))
      .catch((err) => {
        console.error('조회 실패:', err);
        setRecords([]);
      });
  }, [refreshKey]);

  if (records.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>전체 저장된 러닝 기록</h2>
        <p>아직 기록이 없습니다. 첫 번째 러닝 기록을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>전체 저장된 러닝 기록</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>날짜</th>
            <th>거리 (km)</th>
            <th>시간 (분)</th>
            <th>페이스 (min/km)</th>
            <th>속도 (km/h)</th>
            <th>칼로리</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.date || '-'}</td>
              <td>{r.distanceKm ? r.distanceKm.toFixed(2) : '-'}</td>
              <td>{r.durationSec ? (r.durationSec / 60).toFixed(1) : '-'}</td>
              <td>{r.paceMinPerKm ? r.paceMinPerKm.toFixed(2) : '-'}</td>
              <td>{r.speedKmh ? r.speedKmh.toFixed(2) : '-'}</td>
              <td>{r.calories || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunRecordList;