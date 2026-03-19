import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getRunRecords } from '../../apis/performance';
import "../../assets/css/performance.css";
import useAuthStore from '../../store/useAuthStore';
import { TrendingUp, Timer } from 'lucide-react';

const RunTrendChart = ({ refreshKey = 0 }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then((res) => {
        const records = res.data || [];
        const sorted = [...records]
          .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
          .slice(-10);
        
        const formatted = sorted.map(r => ({
          date: r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
          distance: r.distanceKm || 0,
          pace: r.paceMinPerKm || 0
        }));
        setChartData(formatted);
      })
      .catch(console.error);
  }, [refreshKey, userInfo]);

  if (chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: payload[0].color }}>{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="chart-container">
        <h3><TrendingUp size={18} /> DISTANCE TREND (KM)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="distance" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDist)" name="Distance" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3><Timer size={18} /> PACE TREND (MIN/KM)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="pace" stroke="#ff5b5b" name="Pace" strokeWidth={3} dot={{ r: 4, fill: '#ff5b5b' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default RunTrendChart;