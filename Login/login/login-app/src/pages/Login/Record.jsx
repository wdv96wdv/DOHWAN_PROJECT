import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
import Swal from "sweetalert2";
import api from "../../apis/api";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import "../../assets/css/record.css";
import { v4 as uuidv4 } from "uuid";
import { Activity } from "lucide-react";

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
    record_date: new Date().toISOString().slice(0, 10),
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
        running_name: item.runningName,
        distance_km: item.distanceKm,
        duration_sec: item.durationSec,
        pace_min_per_km: item.paceMinPerKm,
        speed_kmh: item.speedKmh,
        record_date: item.recordDate
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
        recordDate: submitData.record_date.length === 10 ? `${submitData.record_date}T00:00:00` : submitData.record_date
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
        cadence: "", calories: "", note: "", record_date: new Date().toISOString().slice(0, 10),
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
      record_date: record.record_date?.slice(0, 10) || "",
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