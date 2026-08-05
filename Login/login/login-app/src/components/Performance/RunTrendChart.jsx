import React, { useEffect, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';
import { getRunRecords } from '../../apis/performance';
import "../../assets/css/performance.css";
import useAuthStore from '../../store/useAuthStore';
import { TrendingUp, Timer, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const RunTrendChart = ({ refreshKey = 0 }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [chartData, setChartData] = useState([]);
  const [limit, setLimit] = useState(10); // Default to last 10 runs

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then((res) => {
        const records = res.data || [];
        const sorted = [...records]
          .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

        const filtered = limit === 0 ? sorted : sorted.slice(-limit);

        const formatted = filtered.map(r => {
          if (!r.date) return { date: '', distance: 0, pace: 0 };

          const [datePart] = r.date.split(' ');
          const [y, m, d] = datePart.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);

          return {
            date: dateObj.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            fullDate: r.date,
            distance: r.distanceKm || 0,
            pace: r.paceMinPerKm || 0
          };
        });
        setChartData(formatted);
      })
      .catch(console.error);
  }, [refreshKey, userInfo, limit]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass">
          <p className="tooltip-label">{label}</p>
          {payload.map((p, index) => (
            <p key={index} style={{ color: p.color, margin: 0, fontWeight: 600 }}>
              {p.name}: {p.value.toFixed(2)} {p.name === 'Distance' ? 'km' : 'min/km'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) return null;

  return (
    <div className="chart-wrapper">
      <div className="chart-controls">
        <div className="filter-title"><Filter size={16} /> VIEW RANGE</div>
        <div className="filter-buttons">
          {[10, 30, 0].map((l) => (
            <button
              key={l}
              className={`filter-btn ${limit === l ? 'active' : ''}`}
              onClick={() => setLimit(l)}
            >
              {l === 0 ? 'ALL' : l}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <h3><TrendingUp size={18} /> DISTANCE TREND</h3>
        <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={0}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} width={30} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Area
              type="monotone"
              dataKey="distance"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorDist)"
              name="Distance"
              strokeWidth={3}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container" style={{ marginTop: '24px' }}>
        <h3><Timer size={18} /> PACE TREND</h3>
        <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={0}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} width={30} tickLine={false} axisLine={false} reversed />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ff5b5b', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Line
              type="monotone"
              dataKey="pace"
              stroke="#ff5b5b"
              name="Pace"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ff5b5b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RunTrendChart;
