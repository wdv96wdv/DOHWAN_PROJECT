import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RunRecordList from '../../components/Performance/RunRecordList';
import PerformanceSummary from '../../components/Performance/PerformanceSummary';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import RunnerProfileChart from '../../components/Performance/RunnerProfileChart';
import GoalTracker from '../../components/Performance/GoalTracker';
import ShareCard from '../../components/Performance/ShareCard';
import { getRunRecords } from '../../apis/performance';
import WaterIntakeCalculator from '../../components/Performance/WaterIntakeCalculator';
import FeedCard from '../../components/Record/FeedCard';
import "../../assets/css/performance.css";
import { BarChart3, Users, User, PlusCircle } from 'lucide-react';

const PerformanceTab = () => {
  const [latestRecord, setLatestRecord] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'feed'
  const [socialFeed, setSocialFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 내 기록 최신화
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

  // 전체 소셜 피드 데이터 로드 (records/feed 전용 API)
  useEffect(() => {
    if (activeTab !== 'feed') return;
    setFeedLoading(true);
    const token = localStorage.getItem('jwt');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/records/feed`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : { data: [] })
      .then(json => {
        const list = json.data || json;
        const normalized = Array.isArray(list) ? list.map(r => ({
          id: r.id,
          username: r.username || '러너',
          avatarUrl: r.avatarUrl || null,
          runningName: r.runningName || '',
          date: r.date ? r.date.slice(0, 10) : '',
          distanceKm: r.distanceKm || 0,
          durationSec: r.durationSec || 0,
          paceMinPerKm: r.paceMinPerKm || 0,
          calories: r.calories || 0,
          reactionCount: r.reactionCount || 0,
          liked: r.liked || false,
        })) : [];
        setSocialFeed(normalized);
      })
      .catch(() => setSocialFeed([]))
      .finally(() => setFeedLoading(false));
  }, [activeTab]);

  const tabStyle = (tab) => ({
    padding: '10px 28px',
    borderRadius: '24px',
    fontWeight: 700,
    fontSize: '1rem',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
    border: `2px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border-color)'}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  });

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

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
        <button style={tabStyle('my')} onClick={() => setActiveTab('my')}>
          <User size={18} /> 내 기록
        </button>
        <button style={tabStyle('feed')} onClick={() => setActiveTab('feed')}>
          <Users size={18} /> 러너 피드
        </button>
      </div>

      {/* === 내 기록 탭 === */}
      {activeTab === 'my' && (
        <>
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
        </>
      )}

      {/* === 러너 피드 탭 === */}
      {activeTab === 'feed' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* 기록 입력 안내 */}
          <div style={{
            marginBottom: '28px', padding: '18px 20px',
            borderRadius: '14px', border: '1.5px dashed var(--primary)',
            background: 'hsla(220, 90%, 60%, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '3px' }}>
                🏃 새 기록을 남기고 싶으신가요?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                기록 페이지에서 나이키 런 사진으로 자동 입력하거나 직접 입력할 수 있습니다.
              </div>
            </div>
            <Link to="/record" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '8px',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap'
            }}>
              <PlusCircle size={16} /> 기록 입력하기
            </Link>
          </div>

          <h3 style={{ margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} /> 러너들의 기록
          </h3>

          {feedLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              기록을 불러오는 중...
            </div>
          ) : socialFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', opacity: 0.6 }}>
              <Users size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p>아직 공유된 기록이 없습니다.</p>
              <p style={{ fontSize: '0.9rem' }}>가장 먼저 기록을 남겨보세요!</p>
            </div>
          ) : (
            socialFeed.map((record, idx) => (
              <motion.div
                key={record.id || idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ duration: 0.3 }}
              >
                <FeedCard record={record} />
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceTab;