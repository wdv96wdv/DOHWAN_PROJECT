import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import supabase from "../../utils/supabaseClient";
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
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("user_no", user_no)
      .order("record_date", { ascending: false });

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
      Swal.fire("Warning", "Title is required", "warning");
      return;
    }
    if (!user_no) {
      Swal.fire("Error", "Unauthorized", "error");
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

      if (submitData.distance_km && submitData.duration_sec) {
        submitData.speed_kmh = submitData.distance_km / (submitData.duration_sec / 3600);
      }

      if (editingId) {
        const { data, error } = await supabase
          .from("records")
          .update(submitData)
          .eq("id", editingId)
          .eq("user_no", parseInt(user_no, 10))
          .select();

        if (error) throw error;
        Swal.fire("Success", "Record updated", "success");
        setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...data[0] } : r));
      } else {
        const { data: inserted, error } = await supabase
          .from("records")
          .insert([{ ...submitData, id: uuidv4(), user_no: parseInt(user_no, 10) }])
          .select();

        if (error) throw error;
        Swal.fire("Success", "Record added", "success");
        setRecords(prev => [inserted[0], ...prev]);
      }

      setFormData({
        running_name: "", distance_km: "", duration_sec: "", pace_min_per_km: "",
        cadence: "", calories: "", note: "", record_date: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save", "error");
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete record?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete"
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("records").delete().eq("id", id).eq("user_no", parseInt(user_no, 10));

    if (error) {
      Swal.fire("Error", "Delete failed", "error");
    } else {
      Swal.fire("Deleted", "Record removed", "success");
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="record-page">
      <header className="record-header">
        <h1><Activity size={32} style={{verticalAlign: 'middle', marginRight: '12px', color: 'var(--primary)'}} /> ACTIVITY LOG</h1>
      </header>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={editingId ? "UPDATE RECORD" : "LOG RUN"}
      />

      <RecordList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
