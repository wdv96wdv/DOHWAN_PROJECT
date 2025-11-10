// src/services/performance.js
import supabase from '../utils/supabaseClient';



// 러닝 기록 저장
export const saveRunRecord = async (runData, user_no) => {
  // user_no는 이제 호출하는 곳에서 유효성 검사를 거쳐 전달된다고 가정
  // if (!user_no) {
  //   throw new Error("로그인이 필요합니다.");
  // }

  // 속도 계산 (km/h) = distance_km / (duration_sec / 3600)
  const speedKmh = runData.distanceKm && runData.durationSec
    ? (runData.distanceKm / (runData.durationSec / 3600))
    : null;

  // 페이스 계산 (분/km) = (duration_sec / 60) / distance_km
  const paceMinPerKm = runData.distanceKm && runData.durationSec
    ? Math.round(((runData.durationSec / 60) / runData.distanceKm) * 100)
    : null;

  const recordData = {
    id: runData.id || crypto.randomUUID(),
    user_no: user_no,
    running_name: runData.running_name || `러닝 기록 ${new Date(runData.created_at || Date.now()).toLocaleDateString()}`,
    distance_km: runData.distanceKm || null,
    duration_sec: runData.durationSec || null,
    pace_min_per_km: paceMinPerKm,
    speed_kmh: speedKmh,
    cadence: runData.cadence || null,
    calories: runData.calories || null,
    note: runData.note || null,
    created_at: runData.created_at ? new Date(runData.created_at).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("records")
    .insert([recordData])
    .select()
    .single();

  if (error) throw error;
  return { data };
};

// 러닝 기록 전체 조회
export const getRunRecords = async (user_no) => {
  if (!user_no) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_no", user_no)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Performance 페이지 형식으로 변환
  const formattedData = (data || []).map(record => ({
    id: record.id,
    date: record.created_at ? new Date(record.created_at).toISOString().split('T')[0] : null,
    distanceKm: record.distance_km || 0,
    durationSec: record.duration_sec || 0,
    paceMinPerKm: record.pace_min_per_km ? (record.pace_min_per_km / 100) : 0, // 123 -> 1.23
    speedKmh: record.speed_kmh || (record.distance_km && record.duration_sec
      ? (record.distance_km / (record.duration_sec / 3600))
      : 0),
    calories: record.calories || 0,
    cadence: record.cadence || null,
    runningName: record.running_name || '',
    note: record.note || null,
  }));

  return { data: formattedData };
};

// 러닝 통계 조회
export const getRunStats = async (user_no) => {
  const records = await getRunRecords(user_no);
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

// 러닝 트렌드 조회
export const getRunTrend = async (user_no) => {
  return getRunRecords(user_no);
};

// ✅ 목표 저장
export const saveGoal = async (goalData, user_no) => {
  const targetValue = Number(goalData.target_value);

  // 범위 검증
  if (targetValue < 0 || targetValue > 10000) {
    throw new Error("목표 값은 0 이상 10000 이하로 입력해야 합니다.");
  }

  const { data, error } = await supabase
    .from("goal")
    .insert([
      {
        title: goalData.title,
        target_value: targetValue,
        unit: goalData.unit,
        user_no: user_no
      },
    ]);

  if (error) throw error;
  return { data };
};



// ✅ 목표 목록 조회
export const getGoals = async (user_no) => {
  const { data, error } = await supabase
    .from("goal")
    .select("*")
    .eq("user_no", user_no)
    .order("id", { ascending: false });

  if (error) throw error;

  return {
    data: data.map((g) => ({
      id: g.id,
      title: g.title,
      targetValue: g.target_value,
      unit: g.unit,
    })),
  };
};

// ✅ ✅ 목표 삭제
export const deleteGoal = async (id, user_no) => {
  const { error } = await supabase
    .from("goal")
    .delete()
    .eq("id", id)
    .eq("user_no", user_no);

  if (error) throw error;
};

// ✅ 목표 수정
export const updateGoal = async (goalData, user_no) => {
  const targetValue = Number(goalData.target_value);

  // 범위 검증
  if (targetValue < 0 || targetValue > 10000) {
    throw new Error("목표 값은 0 이상 10000 이하로 입력해야 합니다.");
  }

  const { data, error } = await supabase
    .from("goal")
    .update({
      title: goalData.title,
      target_value: targetValue,
      unit: goalData.unit,
    })
    .eq("id", goalData.id)
    .eq("user_no", user_no);

  if (error) throw error;
  return { data };
};

// CSV 업로드 (추후 구현 가능)
export const uploadCsv = async (file) => {
  // TODO: CSV 파싱 후 records에 저장
  throw new Error("CSV 업로드는 아직 구현되지 않았습니다.");
};