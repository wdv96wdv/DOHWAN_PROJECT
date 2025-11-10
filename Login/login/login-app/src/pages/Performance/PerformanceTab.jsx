import React, { useEffect, useState } from 'react';
import RunRecordList from '../../components/Performance/RunRecordList';
import RunStatsCard from '../../components/Performance/RunStatsCard';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import GoalTracker from '../../components/Performance/GoalTracker';
// import CsvUploader from '../../components/Performance/CsvUploader';
import ShareCard from '../../components/Performance/ShareCard';
import { getRunRecords } from '../../apis/performance';
import WaterIntakeCalculator from '../../components/Performance/WaterIntakeCalculator';
import styles from '../../assets/css/common.module.css';

const PerformanceTab = () => {
  const [latestRecord, setLatestRecord] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    getRunRecords()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setLatestRecord(sorted[0] || null);
      })
      .catch((err) => {
        console.error('기록 불러오기 실패:', err);
      });
  }, [refreshKey]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div>
          <h2 className={styles.title}>퍼포먼스 분석</h2>
        </div>
      </div>

      <RunStatsCard refreshKey={refreshKey} />
      <RunRecordList refreshKey={refreshKey} />
      <RunTrendChart refreshKey={refreshKey} />
      <GoalTracker />
      {/* <CsvUploader /> */}
      <ShareCard record={latestRecord} />
      <WaterIntakeCalculator />
    </div>
  );
};

export default PerformanceTab;