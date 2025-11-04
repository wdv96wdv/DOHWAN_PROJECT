// src/pages/RecordPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import supabase from "../../utils/supabaseClient";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";

import common from "../../assets/css/common.module.css";     // ✅ 공통 UI
import record from "../../assets/css/record.module.css";     // ✅ Record 전용 UI

import { v4 as uuidv4 } from "uuid";

/** JWT에서 user_no(pk) 추출 */
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

/** 페이스 포맷 */
const formatPace = (value) => {
  return value;
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
  });
  const [editingId, setEditingId] = useState(null);

  const user_no = getUserNoFromJWT();

  /** 로그인 사용자 기록 불러오기 */
  useEffect(() => {
    if (user_no) fetchRecords();
  }, [user_no]);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("user_no", user_no)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("불러오기 오류:", error);
      Swal.fire("오류", "기록을 불러오지 못했습니다.", "error");
    } else {
      setRecords(data || []);
    }
  };

  /** 등록 / 수정 */
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

      if (submitData.pace_min_per_km) {
        const pace = submitData.pace_min_per_km.replace(/[^0-9]/g, "");
        submitData.pace_min_per_km = pace ? parseInt(pace, 10) : null;
      }

      if (submitData.distance_km)
        submitData.distance_km = parseFloat(submitData.distance_km);

      if (submitData.duration_sec)
        submitData.duration_sec = parseInt(submitData.duration_sec, 10);

      if (submitData.cadence)
        submitData.cadence = parseInt(submitData.cadence, 10);

      if (submitData.calories)
        submitData.calories = parseInt(submitData.calories, 10);

      if (submitData.distance_km && submitData.duration_sec) {
        submitData.speed_kmh =
          submitData.distance_km / (submitData.duration_sec / 3600);
      }

      if (
        !submitData.pace_min_per_km &&
        submitData.distance_km &&
        submitData.duration_sec
      ) {
        const paceInMinutes =
          submitData.duration_sec / 60 / submitData.distance_km;
        const minutes = Math.floor(paceInMinutes);
        const seconds = Math.round((paceInMinutes - minutes) * 60);

        submitData.pace_min_per_km = parseInt(
          `${minutes}${seconds.toString().padStart(2, "0")}`,
          10
        );
      }

      if (editingId) {
        delete submitData.created_at;
        submitData.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from("records")
          .update(submitData)
          .eq("id", editingId)
          .eq("user_no", user_no);

        if (error) throw error;

        Swal.fire("성공", "기록이 수정되었습니다!", "success");
      } else {
        const { error } = await supabase.from("records").insert([
          {
            ...submitData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_no,
          },
        ]);

        if (error) throw error;

        Swal.fire("성공", "새 러닝 기록이 추가되었습니다!", "success");
      }

      setFormData({
        running_name: "",
        distance_km: "",
        duration_sec: "",
        pace_min_per_km: "",
        cadence: "",
        calories: "",
        note: "",
      });
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire("오류", "저장 중 문제가 발생했습니다.", "error");
    }
  };

  /** 수정 버튼 */
  const handleEdit = (record) => {
    setFormData({
      running_name: record.running_name || "",
      distance_km: record.distance_km || "",
      duration_sec: record.duration_sec || "",
      pace_min_per_km: record.pace_min_per_km || "",
      cadence: record.cadence || "",
      calories: record.calories || "",
      note: record.note || "",
    });
    setEditingId(record.id);
  };

  /** 삭제 */
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
      .eq("user_no", user_no);

    if (error) {
      Swal.fire("오류", "삭제에 실패했습니다.", "error");
    } else {
      Swal.fire("삭제 완료", "기록이 삭제되었습니다!", "success");
      fetchRecords();
    }
  };

  return (
    <div className={common.container}>  {/* ✅ 페이지 전체 공통 레이아웃 */}
      <h1 className={common.title}>기록</h1>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "수정 완료" : "등록"}
      />

      <div className={common.section}>   {/* ✅ 공통 섹션 스타일 */}
        <RecordList
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
