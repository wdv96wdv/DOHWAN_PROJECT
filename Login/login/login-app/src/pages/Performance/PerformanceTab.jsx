import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import RunRecordList from '../../components/Performance/RunRecordList';
import PerformanceSummary from '../../components/Performance/PerformanceSummary';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import RunnerProfileChart from '../../components/Performance/RunnerProfileChart';
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
      </Helmet>

      <header className="performance-header">
        <h1>
          <BarChart3 size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} />
          PERFORMANCE
        </h1>
      </header>

      <PerformanceSummary refreshKey={refreshKey} />

      <div className="charts-grid">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <RunTrendChart refreshKey={refreshKey} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <RunnerProfileChart refreshKey={refreshKey} />
        </motion.div>
      </div>

      <div className="widgets-grid">
        <motion.div
          className="widgets-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GoalTracker />
          <WaterIntakeCalculator />
        </motion.div>

        <motion.div
          className="widgets-right"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <ShareCard record={latestRecord} />
        </motion.div>
      </div>

      <motion.section
        style={{ marginTop: '48px' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <RunRecordList refreshKey={refreshKey} onRefresh={refreshData} />
      </motion.section>
    </div>
  );
};

export default PerformanceTab;