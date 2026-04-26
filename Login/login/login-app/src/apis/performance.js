// src/apis/performance.js
import api from './api';

/**
 * 러닝 기록 저장
 * @param {Object} runData 
 * @returns {Promise}
 */
export const saveRunRecord = async (runData) => {
  // 속도 계산 (km/h) = distance_km / (duration_sec / 3600)
  const speedKmh = runData.distanceKm && runData.durationSec
    ? (runData.distanceKm / (runData.durationSec / 3600))
    : null;

  // 페이스 계산 (분/km) = (duration_sec / 60) / distance_km
  const paceMinPerKm = runData.distanceKm && runData.durationSec
    ? Math.round(((runData.durationSec / 60) / runData.distanceKm) * 100)
    : null;

  // 날짜와 현재 시간을 결합
  let recordDate = new Date();
  if (runData.date) {
    const [year, month, day] = runData.date.split('-').map(Number);
    const now = new Date();
    recordDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
  }

  // NRC 스타일 제목 자동 생성 함수
  const getNrcStyleTitle = (date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return "아침 러닝";
    if (hour >= 11 && hour < 14) return "오후 러닝";
    if (hour >= 14 && hour < 17) return "오후 러닝";
    if (hour >= 17 && hour < 21) return "저녁 러닝";
    return "밤 러닝";
  };

  // 백엔드 Records 엔티티 구조에 맞게 변환
  const recordData = {
    runningName: runData.runningName || getNrcStyleTitle(recordDate),
    distanceKm: runData.distanceKm || null,
    durationSec: runData.durationSec || null,
    paceMinPerKm: paceMinPerKm,
    speedKmh: speedKmh,
    cadence: runData.cadence || null,
    calories: runData.calories || null,
    note: runData.note || null,
    recordDate: recordDate.toISOString(),
  };

  const response = await api.post("/records", recordData);
  return response.data;
};

/**
 * 러닝 기록 전체 조회
 * @returns {Promise}
 */
export const getRunRecords = async () => {
  const response = await api.get("/records");
  const data = response.data.data || [];

  // 프론트엔드 UI 형식으로 변환
  const formattedData = data.map(record => {
    const d = (record.recordDate || record.record_date) ? new Date(record.recordDate || record.record_date) : null;
    let dateStr = null;
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      dateStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    
    return {
      id: record.id,
      date: dateStr,
      distanceKm: record.distanceKm || record.distance_km || 0,
      durationSec: record.durationSec || record.duration_sec || 0,
      paceMinPerKm: (record.paceMinPerKm || record.pace_min_per_km) ? ((record.paceMinPerKm || record.pace_min_per_km) / 100) : 0,
      speedKmh: record.speedKmh || record.speed_kmh || 0,
      calories: record.calories || 0,
      cadence: record.cadence || null,
      runningName: record.runningName || record.running_name || '',
      note: record.note || null,
    };
  });

  return { data: formattedData };
};

/**
 * 러닝 통계 조회 (기존 로직 유지하며 백엔드 데이터 사용)
 */
export const getRunStats = async () => {
  const records = await getRunRecords();
  const data = records.data || [];

  if (data.length === 0) {
    return {
      data: {
        totalDistance: 0,
        totalDuration: 0,
        totalCalories: 0,
        avgPace: 0,
        avgSpeed: 0,
      }
    };
  }

  const totalDistance = data.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const totalDuration = data.reduce((sum, r) => sum + (r.durationSec || 0), 0);
  const totalCalories = data.reduce((sum, r) => sum + (r.calories || 0), 0);
  const avgPace = totalDistance > 0 ? (totalDuration / 60) / totalDistance : 0;
  const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 3600) : 0;

  return {
    data: {
      totalDistance,
      totalDuration,
      totalCalories,
      avgPace,
      avgSpeed,
    }
  };
};

/**
 * 러닝 트렌드 조회
 */
export const getRunTrend = async () => {
  return getRunRecords();
};

/**
 * 목표 저장
 */
export const saveGoal = async (goalData) => {
  const targetValue = Number(goalData.targetValue);

  // 범위 검증
  if (targetValue < 0 || targetValue > 10000) {
    throw new Error("목표 값은 0 이상 10000 이하로 입력해야 합니다.");
  }

  const response = await api.post("/run/goal", {
    title: goalData.title,
    targetValue: targetValue,
    unit: goalData.unit
  });
  
  return response.data;
};

/**
 * 목표 목록 조회
 */
export const getGoals = async () => {
  const response = await api.get("/run/goal");
  const data = response.data.data || [];

  return {
    data: data.map((g) => ({
      id: g.id,
      title: g.title,
      targetValue: g.targetValue,
      unit: g.unit,
    })),
  };
};

/**
 * 목표 삭제
 */
export const deleteGoal = async (id) => {
  const response = await api.delete(`/run/goal/${id}`);
  return response.data;
};

/**
 * 목표 수정
 */
export const updateGoal = async (goalData) => {
  const targetValue = Number(goalData.targetValue);

  // 범위 검증
  if (targetValue < 0 || targetValue > 10000) {
    throw new Error("목표 값은 0 이상 10000 이하로 입력해야 합니다.");
  }

  const response = await api.put(`/run/goal/${goalData.id}`, {
    title: goalData.title,
    targetValue: targetValue,
    unit: goalData.unit,
  });
  
  return response.data;
};

/**
 * CSV 업로드 (추후 구현 가능)
 */
export const uploadCsv = async (file) => {
  throw new Error("CSV 업로드는 아직 구현되지 않았습니다.");
};