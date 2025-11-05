// src/pages/RecordPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import supabase from "../../utils/supabaseClient";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import common from "../../assets/css/common.module.css";
import { v4 as uuidv4 } from "uuid";

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
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    running_name: "",
    distance_km: "",
    duration_sec: "",
    pace_min_per_km: "",
    cadence: "",
    calories: "",
    note: "",
    record_date: "", // ← 추가
  });
  const [editingId, setEditingId] = useState(null);
  const user_no = getUserNoFromJWT();

  useEffect(() => {
    if (user_no) fetchRecords();
  }, [user_no]);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("user_no", user_no)
      .order("record_date", { ascending: false }); // ← record_date 기준 정렬

    if (error) {
      console.error("불러오기 오류:", error);
      Swal.fire("오류", "기록을 불러오지 못했습니다.", "error");
    } else {
      setRecords(data || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.running_name.trim()) {
      Swal.fire("입력 오류", "러닝 제목은 필수입니다!", "warning");
      return;
    }
    if (!user_no) {
      Swal.fire("오류", "로그인 정보가 없습니다.", "error");
      return;
    }

    try {
      const submitData = { ...formData };

      // record_date가 없으면 오늘 날짜 기본값
      if (!submitData.record_date) {
        submitData.record_date = new Date().toISOString();
      }

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

      if (!submitData.pace_min_per_km && submitData.distance_km && submitData.duration_sec) {
        const paceInMinutes = submitData.duration_sec / 60 / submitData.distance_km;
        const minutes = Math.floor(paceInMinutes);
        const seconds = Math.round((paceInMinutes - minutes) * 60);
        submitData.pace_min_per_km = parseInt(`${minutes}${seconds.toString().padStart(2, "0")}`, 10);
      }

      if (editingId) {
        const { data, error } = await supabase
          .from("records")
          .update(submitData)
          .eq("id", editingId)
          .eq("user_no", parseInt(user_no, 10))
          .select();

        if (error) throw error;
        Swal.fire("성공", "기록이 수정되었습니다!", "success");

        setRecords((prev) =>
          prev.map((r) => (r.id === editingId ? { ...r, ...data[0] } : r))
        );
      } else {
        const { data: inserted, error } = await supabase
          .from("records")
          .insert([
            {
              ...submitData,
              id: uuidv4(),
              user_no: parseInt(user_no, 10),
            },
          ])
          .select();

        if (error) throw error;
        Swal.fire("성공", "새 러닝 기록이 추가되었습니다!", "success");
        setRecords((prev) => [inserted[0], ...prev]);
      }

      // form 초기화 (record_date는 기본값 유지)
      setFormData({
        running_name: "",
        distance_km: "",
        duration_sec: "",
        pace_min_per_km: "",
        cadence: "",
        calories: "",
        note: "",
        record_date: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      Swal.fire("오류", "저장 중 문제가 발생했습니다.", "error");
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
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 후 되돌릴 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("records")
      .delete()
      .eq("id", id)
      .eq("user_no", parseInt(user_no, 10));

    if (error) {
      Swal.fire("오류", "삭제에 실패했습니다.", "error");
    } else {
      Swal.fire("삭제 완료", "기록이 삭제되었습니다!", "success");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className={common.container}>
      <h1 className={common.title}>기록</h1>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "수정 완료" : "등록"}
      />

      <div className={common.section}>
        <RecordList
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
