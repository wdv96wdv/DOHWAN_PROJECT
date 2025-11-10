import React, { useEffect, useState, useContext } from 'react';
import { getRunRecords } from '../../apis/performance';
import styles from '../../assets/css/common.module.css';
import { LoginContext } from '../../contexts/LoginContextProvider'; // LoginContext import

const RunStatsCard = ({ refreshKey = 0 }) => {
  const { userInfo } = useContext(LoginContext); // userInfo 가져오기
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgPace: 0,
    avgSpeed: 0
  });

  useEffect(() => {
    if (!userInfo || !userInfo.no) {
      console.warn('로그인 정보가 없어 러닝 통계를 불러올 수 없습니다.');
      setStats({
        totalDistance: 0,
        totalDuration: 0,
        totalCalories: 0,
        avgPace: 0,
        avgSpeed: 0
      });
      return;
    }

    getRunRecords(userInfo.no)
      .then((res) => {
        const records = res.data || [];
        if (records.length === 0) {
          setStats({
            totalDistance: 0,
            totalDuration: 0,
            totalCalories: 0,
            avgPace: 0,
            avgSpeed: 0
          });
          return;
        }

        const totalDistance = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
        const totalDuration = records.reduce((sum, r) => sum + (r.durationSec || 0), 0);
        const totalCalories = records.reduce((sum, r) => sum + (r.calories || 0), 0);
        const avgPace = totalDistance > 0 ? (totalDuration / 60) / totalDistance : 0;
        const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 3600) : 0;

        setStats({
          totalDistance,
          totalDuration,
          totalCalories,
          avgPace,
          avgSpeed
        });
      })
      .catch((err) => {
        console.error('통계 조회 실패:', err);
        setStats({
          totalDistance: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgPace: 0,
          avgSpeed: 0
        });
      });
  }, [refreshKey, userInfo]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>전체 러닝 통계 요약</h2>
      <div className={styles.section}>
        <p className={styles.pageText}>총 거리: {stats.totalDistance.toFixed(2)} km</p>
        <p className={styles.pageText}>총 시간: {(stats.totalDuration / 60).toFixed(1)} 분</p>
        <p className={styles.pageText}>총 칼로리: {stats.totalCalories} kcal</p>
        <p className={styles.pageText}>평균 페이스: {stats.avgPace.toFixed(2)} 분/km</p>
        <p className={styles.pageText}>평균 속도: {stats.avgSpeed.toFixed(2)} km/h</p>
      </div>
    </div>
  );
};

export default RunStatsCard;