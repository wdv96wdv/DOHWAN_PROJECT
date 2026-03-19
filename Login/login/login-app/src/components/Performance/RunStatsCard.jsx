import React, { useEffect, useState } from 'react';
import { getRunRecords } from '../../apis/performance';
import "../../assets/css/performance.css";
import useAuthStore from '../../store/useAuthStore';
import { Route, Clock, Flame, Zap, Activity } from 'lucide-react';

const RunStatsCard = ({ refreshKey = 0 }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgPace: 0,
    avgSpeed: 0
  });

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then((res) => {
        const records = res.data || [];
        if (records.length === 0) return;

        const totalDistance = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
        const totalDuration = records.reduce((sum, r) => sum + (r.durationSec || 0), 0);
        const totalCalories = records.reduce((sum, r) => sum + (r.calories || 0), 0);
        const avgPace = totalDistance > 0 ? (totalDuration / 60) / totalDistance : 0;
        const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 3600) : 0;

        setStats({ totalDistance, totalDuration, totalCalories, avgPace, avgSpeed });
      })
      .catch(console.error);
  }, [refreshKey, userInfo]);

  const statItems = [
    { label: "Total Distance", value: `${stats.totalDistance.toFixed(2)} km`, icon: <Route /> },
    { label: "Total Time", value: `${(stats.totalDuration / 60).toFixed(1)} m`, icon: <Clock /> },
    { label: "Total Calories", value: `${stats.totalCalories} kcal`, icon: <Flame /> },
    { label: "Avg Pace", value: `${stats.avgPace.toFixed(2)} m/k`, icon: <Zap /> },
    { label: "Avg Speed", value: `${stats.avgSpeed.toFixed(2)} k/h`, icon: <Activity /> },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, idx) => (
        <div key={idx} className="stat-card">
          <div className="stat-card-icon">{item.icon}</div>
          <div className="stat-card-value">{item.value}</div>
          <div className="stat-card-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default RunStatsCard;