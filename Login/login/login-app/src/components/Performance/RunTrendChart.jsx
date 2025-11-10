import React, { useEffect, useState, useContext } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getRunRecords } from '../../apis/performance';
import styles from '../../assets/css/common.module.css';
import { LoginContext } from '../../contexts/LoginContextProvider'; // LoginContext import

const RunTrendChart = ({ refreshKey = 0 }) => {
  const { userInfo } = useContext(LoginContext); // userInfo 가져오기
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!userInfo || !userInfo.no) {
      console.warn('로그인 정보가 없어 러닝 트렌드 차트를 불러올 수 없습니다.');
      setChartData([]);
      return;
    }

    getRunRecords(userInfo.no)
      .then((res) => {
        const records = res.data || [];
        // 날짜순으로 정렬하고 최근 20개만 표시
        const sorted = [...records]
          .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
          .slice(-20);
        
        const formatted = sorted.map(r => ({
          date: r.date ? new Date(r.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '',
          distance: r.distanceKm || 0,
          pace: r.paceMinPerKm || 0
        }));
        
        setChartData(formatted);
      })
      .catch((err) => {
        console.error('차트 데이터 조회 실패:', err);
        setChartData([]);
      });
  }, [refreshKey, userInfo]);

  if (chartData.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>러닝 트렌드 분석</h2>
        <p>차트를 표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>러닝 트렌드 분석</h2>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ flex: '1 1 360px' }}>
          <h3 className={styles.subtitle}>일별 거리 변화</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="km" width={60} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="distance" stroke="#4b8cf5" name="거리 (km)" />      
            </LineChart>
          </ResponsiveContainer>
          </div>

          <div style={{ flex: '1 1 360px' }}>
          <h3 className={styles.subtitle}>일별 평균 페이스</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="min/km" width={80} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pace" stroke="#ff5b5b" name="페이스 (min/km)" />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunTrendChart;