import React, { useState, useEffect } from "react";
import RecordList from "../components/Record/RecordList";
import RecordForm from "../components/Record/RecordForm";
import "../assets/css/record.css";

export default function RecordPage() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    exerciseName: "",
    weight: "",
    roundCount: "",
    reps: "",
    note: ""
  });
  const [submitText, setSubmitText] = useState("기록 추가");

  useEffect(() => {
    // API로 데이터 가져오기 (더미 데이터로 일단 확인)
    const dummy = [
      {
        id: "1",
        exerciseName: "조깅",
        weight: 5,
        roundCount: 10,
        reps: 100,
        note: "오늘 날씨 좋음",
        createdAt: new Date()
      }
    ];
    setRecords(dummy);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRecords((prev) => [...prev, { ...formData, id: Date.now(), createdAt: new Date() }]);
    setFormData({ exerciseName: "", weight: "", roundCount: "", reps: "", note: "" });
  };

  useEffect(() => {
  document.body.classList.add('custom-bg');

  return () => {
    document.body.classList.remove('custom-bg'); // cleanup
  };
},[]);

  const handleEdit = (record) => {
    setFormData(record);
    setSubmitText("기록 수정");
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Dorunning</h1>
        <div className="subtitle">DOHWAN MVP PROJECT</div>
      </div>

      <RecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText={submitText}
      />

      <div className="records-section">
        <div className="records-header">
          <h2 className="section-title">러닝 기록 목록</h2>
        </div>
        <RecordList records={records} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
