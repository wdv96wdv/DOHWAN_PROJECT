import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
import Swal from "sweetalert2";
import api from "../../apis/api";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import "../../assets/css/record.css";
import { v4 as uuidv4 } from "uuid";
import { Activity } from "lucide-react";
import { Helmet } from 'react-helmet-async';

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
  const navigate = useNavigate(); // ✅ 네비게이트 훅 선언
  const [records, setRecords] = useState([]);
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

  useEffect(() => {
    if (user_no) fetchRecords();
  }, [user_no]);

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
      Swal.fire("오류", "기록을 불러오지 못했습니다.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.running_name.trim()) {
      Swal.fire("경고", "활동 제목을 입력해주세요.", "warning"); // ✅ 한글화
      return;
    }
    if (!user_no) {
      Swal.fire("에러", "로그인이 필요한 서비스입니다.", "error"); // ✅ 한글화
      return;
    }

    try {
      const submitData = { ...formData };
      if (!submitData.record_date) submitData.record_date = new Date().toISOString();

      // 데이터 정제 로직은 그대로 유지
      submitData.pace_min_per_km = submitData.pace_min_per_km
        ? parseInt(String(submitData.pace_min_per_km).replace(/[^0-9]/g, ""), 10)
        : null;
      submitData.distance_km = submitData.distance_km ? parseFloat(submitData.distance_km) : null;
      submitData.duration_sec = submitData.duration_sec ? parseInt(submitData.duration_sec, 10) : null;
      submitData.cadence = submitData.cadence ? parseInt(submitData.cadence, 10) : null;
      submitData.calories = submitData.calories ? parseInt(submitData.calories, 10) : null;

      // 누락된 데이터 자동 계산 로직 (거리, 시간, 페이스 중 2개가 있으면 나머지 1개 계산)
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
          confirmButtonText: "확인"
        }).then(() => {
          setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...normalized } : r));
        });

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
          title: "등록 완료",
          text: "오늘의 러닝 기록을 저장했습니다. 수고하셨어요! 🏃‍♂️",
          icon: "success",
          confirmButtonText: "확인"
        }).then(() => {
          setRecords(prev => [normalized, ...prev]);
        });
      }

      // 폼 초기화
      setFormData({
        running_name: "", distance_km: "", duration_sec: "", pace_min_per_km: "",
        cadence: "", calories: "", note: "", record_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      });
      setEditingId(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 수정 시 폼이 있는 상단으로 이동
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "기록 삭제",
      text: "정말로 이 활동 기록을 삭제하시겠습니까? 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/records/${id}`);
      Swal.fire("삭제 완료", "기록이 삭제되었습니다.", "success");
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      Swal.fire("오류", "삭제에 실패했습니다.", "error");
    }
  };

  return (
    <div className="record-page">
      <Helmet>
        <title>Dorunning | 기록</title>
        <meta name="description" content="나의 매일매일 러닝 기록을 체계적으로 저장하고 분석하세요. 거리, 시간, 페이스 통계를 한눈에 확인하며 성장의 즐거움을 느껴보세요." />
        <meta property="og:title" content="Dorunning | 러닝기록" />
        <meta property="og:description" content="나의 매일매일 러닝 기록을 체계적으로 저장하고 분석하세요." />
        <link rel="canonical" href="https://dorunning.vercel.app/record" />
      </Helmet>
      <header className="record-header">
        <h1><Activity size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> RECORD</h1>
      </header>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "기록 수정하기" : "활동 저장하기"}
      />

      <RecordList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}