import React, { useEffect, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { getRunRecords } from '../../apis/performance';
import useAuthStore from '../../store/useAuthStore';
import { UserCheck } from 'lucide-react';
import "../../assets/css/performance.css";

const RunnerProfileChart = ({ refreshKey }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [profileData, setProfileData] = useState([]);

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then(res => {
        const records = res.data || [];
        if (records.length === 0) return;

        // Calculate normalized metrics (0-100 scale for radar)
        const maxDist = Math.max(...records.map(r => r.distanceKm || 0), 10);
        const avgDist = records.reduce((acc, curr) => acc + (curr.distanceKm || 0), 0) / records.length;
        
        const validPaces = records.filter(r => r.paceMinPerKm > 0);
        const bestPace = Math.min(...validPaces.map(r => r.paceMinPerKm), 10);
        const avgPace = validPaces.length > 0 
          ? validPaces.reduce((acc, curr) => acc + curr.paceMinPerKm, 0) / validPaces.length 
          : 10;

        const totalCalories = records.reduce((acc, curr) => acc + (curr.calories || 0), 0);
        const avgCalories = totalCalories / records.length;

        // Normalize (this is a rough heuristic)
        const data = [
          { subject: 'Endurance', A: Math.min((avgDist / 10) * 100, 100), fullMark: 100 },
          { subject: 'Speed', A: Math.min((6 / avgPace) * 100, 100), fullMark: 100 },
          { subject: 'Consistency', A: Math.min((records.length / 20) * 100, 100), fullMark: 100 },
          { subject: 'Stamina', A: Math.min((avgCalories / 800) * 100, 100), fullMark: 100 },
          { subject: 'Power', A: Math.min((maxDist / 21) * 100, 100), fullMark: 100 },
        ];

        setProfileData(data);
      })
      .catch(console.error);
  }, [refreshKey, userInfo]);

  if (profileData.length === 0) return null;

  return (
    <div className="chart-container radar-container">
      <h3><UserCheck size={18} /> RUNNER PROFILE</h3>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profileData}>
            <PolarGrid stroke="var(--glass-border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Runner"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RunnerProfileChart;
