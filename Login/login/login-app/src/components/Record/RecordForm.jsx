import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import '../../assets/css/record.css';

export default function RecordForm({ formData, setFormData, onSubmit, submitText }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="input-section">
      <h2 className="section-title">러닝 기록 입력</h2>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="exerciseName">러닝 제목 *</label>
            <input
              type="text"
              id="exerciseName"
              name="exerciseName"
              value={formData.exerciseName}
              placeholder="예: 아침 러닝, 트레드밀 5km 등"
              maxLength={30}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight">거리 (km)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              step="0.01"
              min="0"
              value={formData.weight}
              onChange={handleChange}
              placeholder="예: 5.2"

            />
          </div>
          <div className="form-group">
            <label htmlFor="roundCount">평균 페이스 (분/km)</label>
            <input
              type="number"
              id="roundCount"
              name="roundCount"
              min="1"
              placeholder="예: 547 -> 5'47''"
              value={formData.roundCount}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reps">케이던스 (보/분)</label>
            <input
              type="number"
              id="reps"
              name="reps"
              min="1"
              max="300"
              value={formData.reps}
              onChange={handleChange}
              placeholder="예: 170"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="note">노트</label>
          <textarea
            id="note"
            name="note"
            placeholder="러닝에 대한 추가 메모를 입력하세요..."
            value={formData.note}
            onChange={handleChange}
          />
        </div>
        <div className="btn-container">
          <button type="submit" className="record">{submitText}</button>
        </div>
      </form>
    </div>
  );
}

