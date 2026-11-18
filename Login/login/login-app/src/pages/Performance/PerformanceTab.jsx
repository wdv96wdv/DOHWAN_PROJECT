import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import RunRecordList from '../../components/Performance/RunRecordList';
import PerformanceSummary from '../../components/Performance/PerformanceSummary';
import RunTrendChart from '../../components/Performance/RunTrendChart';
import RunnerProfileChart from '../../components/Performance/RunnerProfileChart';
import GoalTracker from '../../components/Performance/GoalTracker';
import ShareCard from '../../components/Performance/ShareCard';
import { getRunRecords } from '../../apis/performance';
import WaterIntakeCalculator from '../../components/Performance/WaterIntakeCalculator';
import PaceCalculator from '../../components/Marathon/PaceCalculator';
import FeedCard from '../../components/Record/FeedCard';
import "../../assets/css/performance.css";
import { BarChart3, Users, User, PlusCircle } from 'lucide-react';

const PerformanceTab = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const hasAlerted = useRef(false);

  const [latestRecord, setLatestRecord] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'feed'
  const [socialFeed, setSocialFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // ë¹„ë¡œê·¸ì¸ ?‘ê·¼ ì°¨ë‹¨ (URL ì§ì ‘ ?‘ê·¼ ë°©ì?: ê²½ê³  ?ŒëŸ¿ ?œì‹œ ??ë©”ì¸?¼ë¡œ ë¦¬ë‹¤?´ë ‰??
  useEffect(() => {
    if (!isLogin && !hasAlerted.current) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: 'ë¡œê·¸?¸ì´ ?„ìš”?©ë‹ˆ??,
        text: '?¼í¬ë¨¼ìŠ¤ ?˜ì´ì§€??ë¡œê·¸?????´ìš© ê°€?¥í•©?ˆë‹¤.',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '?•ì¸'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLogin, navigate]);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // ??ê¸°ë¡ ìµœì‹ ??  useEffect(() => {
    if (!isLogin) return;
    getRunRecords()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setLatestRecord(sorted[0] || null);
      })
      .catch((err) => {
        console.error('Failed to fetch records:', err);
      });
  }, [refreshKey, isLogin]);

  // ?„ì²´ ?Œì…œ ?¼ë“œ ?°ì´??ë¡œë“œ (records/feed ?„ìš© API)
  useEffect(() => {
    if (activeTab !== 'feed' || !isLogin) return;
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
          username: r.username || '?¬ë„ˆ',
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
  }, [activeTab, isLogin]);

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

  if (!isLogin) {
    return null;
  }

  return (
    <div className="performance-page">
      <Helmet>
        <title>Dorunning | ?¼í¬ë¨¼ìŠ¤</title>
        <meta name="description" content="?˜ì˜ ?„ì  ?¬ë‹ ê±°ë¦¬, ?˜ì´?? ?Œëª¨ ì¹¼ë¡œë¦¬ë? ?•ì¸?˜ê³  ì²´ê³„?ì¸ ?¬ë‹ ëª©í‘œë¥??¤ì •?˜ì„¸?? ?¹ì‹ ???±ì¥??ì°¨íŠ¸ë¡??œëˆˆ??ë³????ˆìŠµ?ˆë‹¤." />
        <link rel="canonical" href="https://www.dorunning.app/performance" />
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
          <User size={18} /> ??ê¸°ë¡
        </button>
        <button style={tabStyle('feed')} onClick={() => setActiveTab('feed')}>
          <Users size={18} /> ?¬ë„ˆ ?¼ë“œ
        </button>
      </div>

      {/* === ??ê¸°ë¡ ??=== */}
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

          {/* ëª©í‘œ ?˜ì´??& ?¤í”Œë¦?ê³„ì‚°ê¸??„êµ¬ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <PaceCalculator initialDistance="10 km" />
          </motion.div>

          <motion.section
            style={{ marginTop: '32px' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <RunRecordList refreshKey={refreshKey} onRefresh={refreshData} />
          </motion.section>
        </>
      )}

      {/* === ?¬ë„ˆ ?¼ë“œ ??=== */}
      {activeTab === 'feed' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* ê¸°ë¡ ?…ë ¥ ?ˆë‚´ */}
          <div style={{
            marginBottom: '28px', padding: '18px 20px',
            borderRadius: '14px', border: '1.5px dashed var(--primary)',
            background: 'hsla(220, 90%, 60%, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '3px' }}>
                ?ƒ ??ê¸°ë¡???¨ê¸°ê³??¶ìœ¼? ê???
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ê¸°ë¡ ?˜ì´ì§€?ì„œ ?˜ì´?????¬ì§„?¼ë¡œ ?ë™ ?…ë ¥?˜ê±°??ì§ì ‘ ?…ë ¥?????ˆìŠµ?ˆë‹¤.
              </div>
            </div>
            <Link to="/record" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '8px',
              background: 'var(--primary)', color: '#fff',
              fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap'
            }}>
              <PlusCircle size={16} /> ê¸°ë¡ ?…ë ¥?˜ê¸°
            </Link>
          </div>

          <h3 style={{ margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} /> ?¬ë„ˆ?¤ì˜ ê¸°ë¡
          </h3>

          {feedLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              ê¸°ë¡??ë¶ˆëŸ¬?¤ëŠ” ì¤?..
            </div>
          ) : socialFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', opacity: 0.6 }}>
              <Users size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p>?„ì§ ê³µìœ ??ê¸°ë¡???†ìŠµ?ˆë‹¤.</p>
              <p style={{ fontSize: '0.9rem' }}>ê°€??ë¨¼ì? ê¸°ë¡???¨ê²¨ë³´ì„¸??</p>
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