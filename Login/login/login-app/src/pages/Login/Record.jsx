// src/pages/RecordPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import supabase from "../../utils/supabaseClient";
import RecordForm from "../../components/Record/RecordForm";
import RecordList from "../../components/Record/RecordList";
import "../../assets/css/record.css";
import { v4 as uuidv4 } from "uuid";

/**
 * JWT에서 user_no(pk)를 추출
 */
const getUserNoFromJWT = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.no; // JWT payload에서 사용자 no(pk)
  } catch (err) {
    console.error("JWT 파싱 실패:", err);
    return null;
  }
};

/**
 * 평균 페이스 숫자 → 화면용 포맷 1'23''
 */
const formatPace = (value) => {
  if (!value) return "-";
  if (isNaN(value)) return value;
  const num = parseInt(value, 10);
  let minutes = Math.floor(num / 100);
  let seconds = num % 100;
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds = seconds % 60;
  }
  return `${minutes}'${seconds.toString().padStart(2, "0")}''`;
};

export default function RecordPage() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    exercise_name: "",
    weight: "",
    round_count: "",
    reps: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  const user_no = getUserNoFromJWT();

  // 페이지 스타일
  useEffect(() => {
    document.querySelector(".app")?.classList.remove("light");
    document.body.classList.add("custom-bg");
    return () => document.body.classList.remove("custom-bg");
  }, []);

  // 로그인 유저 기록 불러오기
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
      setRecords(data);
    }
  };

  // 등록 / 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exercise_name.trim()) {
      Swal.fire("입력 오류", "러닝 제목은 필수입니다!", "warning");
      return;
    }
    if (!user_no) {
      Swal.fire("오류", "로그인 정보가 없습니다.", "error");
      return;
    }

    try {
      const submitData = { ...formData };

      // 수정 시 created_at 제거
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
        // 새 기록 등록
        const { error } = await supabase
          .from("records")
          .insert([
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

      // 폼 초기화 + 목록 갱신
      setFormData({
        exercise_name: "",
        weight: "",
        round_count: "",
        reps: "",
        note: "",
      });
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire("오류", "저장 중 문제가 발생했습니다.", "error");
    }
  };

  // 수정 버튼 클릭
  const handleEdit = (record) => {
    // DB 값 그대로 form에 넣음 (숫자형 round_count)
    setFormData({
      ...record,
      round_count: record.round_count,
    });
    setEditingId(record.id);
  };

  // 삭제
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
      console.error(error);
      Swal.fire("오류", "삭제에 실패했습니다.", "error");
    } else {
      Swal.fire("삭제 완료", "기록이 삭제되었습니다.", "success");
      fetchRecords();
    }
  };

  // 화면용 레코드 변환 (평균 페이스, 날짜)
  const formattedRecords = records.map((r) => ({
    ...r,
    round_count_display: formatPace(r.round_count),
    created_at_display: new Date(r.created_at).toLocaleString(),
  }));

  return (
    <div className="record-page">
      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "수정 완료" : "등록"}
      />
      <div className="records-section">
        <RecordList
          records={formattedRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
