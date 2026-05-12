import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Activity, Zap, Timer, Award } from 'lucide-react';
import { getRunRecords } from '../../apis/performance';
import useAuthStore from '../../store/useAuthStore';
import "../../assets/css/performance.css";

const PerformanceSummary = ({ refreshKey }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalCalories: 0,
    avgPace: 0,
    totalRuns: 0
  });

  useEffect(() => {
    if (!userInfo?.no) return;

    getRunRecords()
      .then(res => {
        const records = res.data || [];
        const totalDist = records.reduce((acc, curr) => acc + (curr.distanceKm || 0), 0);
        const totalCal = records.reduce((acc, curr) => acc + (curr.calories || 0), 0);
        const totalRuns = records.length;
        
        // Calculate average pace (min/km)
        // Note: This is a simplified average of paces, better would be total time / total distance
        const validPaces = records.filter(r => r.paceMinPerKm > 0);
        const avgPace = validPaces.length > 0 
          ? validPaces.reduce((acc, curr) => acc + curr.paceMinPerKm, 0) / validPaces.length 
          : 0;

        setStats({
          totalDistance: totalDist,
          totalCalories: totalCal,
          avgPace: avgPace,
          totalRuns: totalRuns
        });
      })
      .catch(console.error);
  }, [refreshKey, userInfo]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  const summaryItems = [
    { label: 'Total Distance', value: stats.totalDistance, unit: 'km', icon: <Activity />, color: 'var(--primary)' },
    { label: 'Total Calories', value: stats.totalCalories, unit: 'kcal', icon: <Zap />, color: '#ff9f43' },
    { label: 'Average Pace', value: stats.avgPace, unit: 'min/km', icon: <Timer />, color: '#ff5b5b', decimals: 2 },
    { label: 'Total Runs', value: stats.totalRuns, unit: 'sessions', icon: <Award />, color: '#2ecc71' }
  ];

  return (
    <motion.div 
      className="summary-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {summaryItems.map((item, index) => (
        <motion.div key={index} className="summary-card" variants={itemVariants}>
          <div className="summary-icon" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
            {item.icon}
          </div>
          <div className="summary-content">
            <p className="summary-label">{item.label}</p>
            <h2 className="summary-value">
              <CountUp 
                end={item.value} 
                decimals={item.decimals || 0} 
                duration={2} 
                useEasing={true}
              />
              <span className="summary-unit">{item.unit}</span>
            </h2>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PerformanceSummary;
