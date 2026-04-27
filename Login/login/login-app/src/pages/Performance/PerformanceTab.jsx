import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import RunRecordList from '../../components/Performance/RunRecordList';
import RunStatsCard from '../../components/Performance/RunStatsCard';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import GoalTracker from '../../components/Performance/GoalTracker';
import ShareCard from '../../components/Performance/ShareCard';
import { getRunRecords } from '../../apis/performance';
import WaterIntakeCalculator from '../../components/Performance/WaterIntakeCalculator';
import "../../assets/css/performance.css";
import { BarChart3 } from 'lucide-react';

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
        console.error('Failed to fetch records:', err);
      });
  }, [refreshKey]);

  return (
    <div className="performance-page">
      <Helmet>
        <title>Dorunning | 퍼포먼스</title>
        <meta name="description" content="나의 누적 러닝 거리, 페이스, 소모 칼로리를 확인하고 체계적인 러닝 목표를 설정하세요. 당신의 성장을 차트로 한눈에 볼 수 있습니다." />
        <meta property="og:title" content="Dorunning | 퍼포먼스" />
        <meta property="og:description" content="나의 누적 러닝 거리, 페이스, 소모 칼로리를 확인하고 체계적인 러닝 목표를 설정하세요." />
        <link rel="canonical" href="https://dorunning.vercel.app/performance" />
      </Helmet>
      <header className="performance-header">
        <h1><BarChart3 size={40} style={{verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)'}} /> PERFORMANCE</h1>
      </header>

      <section>
        <RunStatsCard refreshKey={refreshKey} />
      </section>

      <div className="charts-grid">
        <RunTrendChart refreshKey={refreshKey} />
      </div>

      <div className="widgets-grid">
        <div className="widgets-left">
          <GoalTracker />
          <WaterIntakeCalculator />
        </div>
        <div className="widgets-right">
          <ShareCard record={latestRecord} />
        </div>
      </div>

      <section style={{marginTop: '48px'}}>
        <RunRecordList refreshKey={refreshKey} />
      </section>
    </div>
  );
};

export default PerformanceTab;