// src/pages/Login/Record.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../apis/api";
import useAuthStore from "../../store/useAuthStore";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import "../../assets/css/record.css";
import { 
  Activity, 
  Plus, 
  ChevronUp, 
  Footprints, 
  Clock, 
  Zap, 
  Trophy,
  Sparkles
} from "lucide-react";
import { Helmet } from 'react-helmet-async';
import dayjs from "dayjs";

const parsePaceToSeconds = (paceStr) => {
  if (!paceStr) return 0;
  const str = String(paceStr);
  if (str.length <= 2) return Number(str);
  const mins = Number(str.slice(0, str.length - 2));
  const secs = Number(str.slice(-2));
  return mins * 60 + secs;
};

const calculatePaceNum = (dist, sec) => {
  if (!dist || !sec || dist <= 0 || sec <= 0) return null;
  const secsPerKm = sec / dist;
  const pMins = Math.floor(secsPerKm / 60);
  const pSecs = Math.floor(secsPerKm % 60);
  return parseInt(`${pMins}${pSecs.toString().padStart(2, '0')}`, 10);
};

const calculateDistance = (paceStr, sec) => {
  if (!paceStr || !sec || sec <= 0) return null;
  const pSecs = parsePaceToSeconds(paceStr);
  if (pSecs <= 0) return null;
  return (sec / pSecs).toFixed(2);
};

const calculateDuration = (dist, paceStr) => {
  if (!dist || dist <= 0 || !paceStr) return null;
  const pSecs = parsePaceToSeconds(paceStr);
  if (pSecs <= 0) return null;
  return Math.round(dist * pSecs);
};

const calculateCalories = (dist) => {
  if (!dist || dist <= 0) return null;
  return Math.round(dist * 65);
};

const getUserNoFromJWT = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.no;
  } catch (err) {
    console.error("JWT 파싱 실패:", err);
    return null;
  }
};

export default function RecordPage() {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const hasAlerted = useRef(false);

  const [records, setRecords] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    running_name: "",
    distance_km: "",
    duration_sec: "",
    pace_min_per_km: "",
    cadence: "",
    calories: "",
    note: "",
    record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  });
  const [editingId, setEditingId] = useState(null);
  const user_no = getUserNoFromJWT();

  // 비로그인 접근 차단
  useEffect(() => {
    if (!isLogin && !hasAlerted.current) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: '기록 페이지는 로그인 후 이용 가능합니다.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLogin, navigate]);

  useEffect(() => {
    if (isLogin && user_no) fetchRecords();
  }, [isLogin, user_no]);

  const fetchRecords = async () => {
    try {
      const response = await api.get("/records");
      const list = (response.data.data || []).map(item => ({
        ...item,
        running_name: item.runningName || item.running_name,
        distance_km: item.distanceKm || item.distance_km,
        duration_sec: item.durationSec || item.duration_sec,
        pace_min_per_km: item.paceMinPerKm || item.pace_min_per_km,
        speed_kmh: item.speedKmh || item.speed_kmh,
        record_date: item.recordDate || item.record_date
      }));
      setRecords(list);
    } catch (error) {
      console.error("불러오기 오류:", error);
    }
  };

  // KPI 통계 계산 (이번 달 누적, 총 횟수, 평균 페이스, 최장 거리)
  const kpiStats = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        monthDistance: "0.0",
        totalRuns: 0,
        avgPace: "-",
        longestRun: "0.0"
      };
    }

    const currentYearMonth = dayjs().format("YYYY-MM");
    let monthDist = 0;
    let maxDist = 0;
    let totalPaceSeconds = 0;
    let paceCount = 0;

    records.forEach(r => {
      const dist = Number(r.distance_km) || 0;
      if (dist > maxDist) maxDist = dist;

      // 이번 달인지 확인
      if (r.record_date && r.record_date.startsWith(currentYearMonth)) {
        monthDist += dist;
      }

      // 페이스 평균 계산
      if (r.pace_min_per_km) {
        const secs = parsePaceToSeconds(r.pace_min_per_km);
        if (secs > 0 && secs < 1200) { // 정상 범위 러닝 페이스 (20분 이내)
          totalPaceSeconds += secs;
          paceCount++;
        }
      }
    });

    // 평균 페이스 문자열 포맷
    let avgPaceStr = "-";
    if (paceCount > 0) {
      const avgSecs = Math.round(totalPaceSeconds / paceCount);
      const mins = Math.floor(avgSecs / 60);
      const secs = avgSecs % 60;
      avgPaceStr = `${mins}'${secs.toString().padStart(2, '0')}''`;
    }

    return {
      monthDistance: monthDist.toFixed(1),
      totalRuns: records.length,
      avgPace: avgPaceStr,
      longestRun: maxDist.toFixed(1)
    };
  }, [records]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.running_name.trim()) {
      Swal.fire("경고", "활동 제목을 입력해주세요.", "warning");
      return;
    }
    if (!user_no) {
      Swal.fire("에러", "로그인이 필요한 서비스입니다.", "error");
      return;
    }

    try {
      const submitData = { ...formData };
      if (!submitData.record_date) submitData.record_date = new Date().toISOString();

      submitData.pace_min_per_km = submitData.pace_min_per_km
        ? parseInt(String(submitData.pace_min_per_km).replace(/[^0-9]/g, ""), 10)
        : null;
      submitData.distance_km = submitData.distance_km ? parseFloat(submitData.distance_km) : null;
      submitData.duration_sec = submitData.duration_sec ? parseInt(submitData.duration_sec, 10) : null;
      submitData.cadence = submitData.cadence ? parseInt(submitData.cadence, 10) : null;
      submitData.calories = submitData.calories ? parseInt(submitData.calories, 10) : null;

      // 누락된 데이터 자동 계산
      if (submitData.distance_km > 0 && submitData.duration_sec > 0 && !submitData.pace_min_per_km) {
        submitData.pace_min_per_km = calculatePaceNum(submitData.distance_km, submitData.duration_sec);
      } else if (submitData.pace_min_per_km > 0 && submitData.duration_sec > 0 && !submitData.distance_km) {
        submitData.distance_km = parseFloat(calculateDistance(String(submitData.pace_min_per_km), submitData.duration_sec));
      } else if (submitData.distance_km > 0 && submitData.pace_min_per_km > 0 && !submitData.duration_sec) {
        submitData.duration_sec = calculateDuration(submitData.distance_km, String(submitData.pace_min_per_km));
      }

      if (submitData.distance_km > 0 && !submitData.calories) {
        submitData.calories = calculateCalories(submitData.distance_km);
      }

      if (submitData.distance_km && submitData.duration_sec) {
        submitData.speed_kmh = submitData.distance_km / (submitData.duration_sec / 3600);
      }

      const backendPayload = {
        runningName: submitData.running_name,
        distanceKm: submitData.distance_km,
        durationSec: submitData.duration_sec,
        paceMinPerKm: submitData.pace_min_per_km,
        speedKmh: submitData.speed_kmh,
        cadence: submitData.cadence,
        calories: submitData.calories,
        note: submitData.note,
        recordDate: submitData.record_date.length === 10 ? `${submitData.record_date}T00:00:00` :
          submitData.record_date.length === 16 ? `${submitData.record_date}:00` : submitData.record_date
      };

      if (editingId) {
        // 수정 모드
        const response = await api.put(`/records/${editingId}`, backendPayload);
        const saved = response.data.data;
        const normalized = {
          ...saved,
          running_name: saved.runningName, distance_km: saved.distanceKm,
          duration_sec: saved.durationSec, pace_min_per_km: saved.paceMinPerKm,
          speed_kmh: saved.speedKmh, record_date: saved.recordDate
        };

        Swal.fire({
          title: "수정 완료",
          text: "활동 기록이 정상적으로 수정되었습니다.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...normalized } : r));

      } else {
        // 등록 모드
        const response = await api.post(`/records`, backendPayload);
        const saved = response.data.data;
        const normalized = {
          ...saved,
          running_name: saved.runningName, distance_km: saved.distanceKm,
          duration_sec: saved.durationSec, pace_min_per_km: saved.paceMinPerKm,
          speed_kmh: saved.speedKmh, record_date: saved.recordDate
        };

        Swal.fire({
          title: "러닝 기록 완료! 🏃‍♂️",
          text: "오늘의 러닝 활동이 성공적으로 저장되었습니다.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setRecords(prev => [normalized, ...prev]);
      }

      // 폼 초기화 및 닫기
      setFormData({
        running_name: "", distance_km: "", duration_sec: "", pace_min_per_km: "",
        cadence: "", calories: "", note: "", record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("실패", "데이터 저장 중 오류가 발생했습니다.", "error");
    }
  };

  const handleEdit = (record) => {
    setFormData({
      running_name: record.running_name || "",
      distance_km: record.distance_km || "",
      duration_sec: record.duration_sec || "",
      pace_min_per_km: record.pace_min_per_km || "",
      cadence: record.cadence || "",
      calories: record.calories || "",
      note: record.note || "",
      record_date: record.record_date?.slice(0, 16) || "",
    });
    setEditingId(record.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "기록 삭제",
      text: "정말로 이 활동 기록을 삭제하시겠습니까? 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/records/${id}`);
      Swal.fire({ title: "삭제 완료", icon: "success", timer: 1200, showConfirmButton: false });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      Swal.fire("오류", "삭제에 실패했습니다.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      running_name: "", distance_km: "", duration_sec: "", pace_min_per_km: "",
      cadence: "", calories: "", note: "", record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    });
    setIsFormOpen(false);
  };

  if (!isLogin) {
    return null;
  }

  return (
    <div className="record-page">
      <Helmet>
        <title>나만의 러닝 기록 & 통계 분석 | 두러닝</title>
        <meta name="description" content="나의 매일매일 러닝 기록을 체계적으로 저장하고 분석하세요. 거리, 시간, 페이스 통계를 한눈에 확인하며 성장의 즐거움을 느껴보세요." />
        <meta property="og:title" content="나만의 러닝 기록 & 통계 분석 | 두러닝" />
        <meta property="og:description" content="나의 매일매일 러닝 기록을 체계적으로 저장하고 분석하세요." />
        <link rel="canonical" href="https://www.dorunning.app/record" />
      </Helmet>

      {/* Hero Header */}
      <header className="record-header">
        <div className="record-header-badge">
          <Sparkles size={14} /> RUNNING LOG & PERFORMANCE
        </div>
        <h1>RUNNING LOG</h1>
        <p className="record-header-desc">
          매일의 땀방울과 레이스 기록을 저장하고 나만의 러닝 성장을 한눈에 확인하세요.
        </p>
      </header>

      {/* KPI Stats Grid */}
      <section className="record-kpi-grid">
        <div className="record-kpi-card">
          <div className="record-kpi-header">
            <span className="record-kpi-label">이번 달 누적</span>
            <div className="record-kpi-icon blue">
              <Footprints size={18} />
            </div>
          </div>
          <div className="record-kpi-value-row">
            <span className="record-kpi-val">{kpiStats.monthDistance}</span>
            <span className="record-kpi-unit">km</span>
          </div>
        </div>

        <div className="record-kpi-card">
          <div className="record-kpi-header">
            <span className="record-kpi-label">총 러닝 횟수</span>
            <div className="record-kpi-icon emerald">
              <Activity size={18} />
            </div>
          </div>
          <div className="record-kpi-value-row">
            <span className="record-kpi-val">{kpiStats.totalRuns}</span>
            <span className="record-kpi-unit">회</span>
          </div>
        </div>

        <div className="record-kpi-card">
          <div className="record-kpi-header">
            <span className="record-kpi-label">평균 페이스</span>
            <div className="record-kpi-icon amber">
              <Zap size={18} />
            </div>
          </div>
          <div className="record-kpi-value-row">
            <span className="record-kpi-val" style={{ fontSize: '1.4rem' }}>{kpiStats.avgPace}</span>
            <span className="record-kpi-unit">/km</span>
          </div>
        </div>

        <div className="record-kpi-card">
          <div className="record-kpi-header">
            <span className="record-kpi-label">최장 거리 (PB)</span>
            <div className="record-kpi-icon purple">
              <Trophy size={18} />
            </div>
          </div>
          <div className="record-kpi-value-row">
            <span className="record-kpi-val">{kpiStats.longestRun}</span>
            <span className="record-kpi-unit">km</span>
          </div>
        </div>
      </section>

      {/* Form Toggle Bar */}
      <div className="record-form-toggle-bar">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          내 활동 피드 ({records.length})
        </h2>

        <div style={{ display: 'flex', gap: '8px' }}>
          {editingId && (
            <button
              type="button"
              className="btn-toggle-form open"
              onClick={handleCancelEdit}
            >
              수정 취소
            </button>
          )}

          <button
            type="button"
            className={`btn-toggle-form ${isFormOpen ? 'open' : ''}`}
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? (
              <>
                <ChevronUp size={16} /> 기록 입력 접기
              </>
            ) : (
              <>
                <Plus size={16} /> 새 활동 기록하기
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Record Form */}
      {isFormOpen && (
        <RecordForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          submitText={editingId ? "기록 수정 저장" : "오늘의 활동 기록 저장"}
        />
      )}

      {/* Record Feed List */}
      <RecordList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
