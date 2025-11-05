import React, { useEffect, useState } from 'react';
import RunRecordList from '../../components/Performance/RunRecordList';
import RunStatsCard from '../../components/Performance/RunStatsCard';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import GoalTracker from '../../components/Performance/GoalTracker';
import CsvUploader from '../../components/Performance/CsvUploader';
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
    getRunRecords().then((res) => {
      const sorted = [...res.data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setLatestRecord(sorted[0] || null);
    }).catch((err) => {
      console.error('기록 불러오기 실패:', err);
    });
  }, [refreshKey]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>퍼포먼스 분석</h2>
          <p style={{ marginTop: '10px', color: '#666' }}>
            기록 입력은 <strong>기록</strong> 페이지에서 해주세요. 여기서는 통계와 분석을 확인할 수 있습니다.
          </p>
        </div>
        <button 
          onClick={refreshData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4b8cf5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 새로고침
        </button>
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