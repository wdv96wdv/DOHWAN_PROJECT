import React, { useEffect, useState } from 'react';
import { getRunRecords } from '../../apis/performance';
import "../../assets/css/performance.css";
import useAuthStore from '../../store/useAuthStore';
import { List } from 'lucide-react';

const RunRecordList = ({ refreshKey = 0 }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then((res) => setRecords(res.data || []))
      .catch(console.error);
  }, [refreshKey, userInfo]);

  if (records.length === 0) return null;

  return (
    <div className="widget-card">
      <h3><List size={18} /> RECENT ACTIVITIES</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="board-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>DATE</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>DIST (KM)</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>TIME (M)</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>PACE</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>KCAL</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '12px' }}>{r.date || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{r.distanceKm?.toFixed(2) || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{r.durationSec ? (r.durationSec / 60).toFixed(1) : '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{r.paceMinPerKm?.toFixed(2) || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{r.calories || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunRecordList;