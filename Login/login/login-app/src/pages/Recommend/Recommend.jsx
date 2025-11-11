import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/css/Recommend.module.css";

const Recommend = () => {
  const navigate = useNavigate();

  const [gender, setGender] = useState("");
  const [purpose, setPurpose] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 입력값 확인
    if (!gender || !purpose ) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    // 결과 페이지로 이동하며 입력값 전달
    navigate("/recommend/result", {
      state: { gender, purpose, budget },
    });
  };

  return (
    <div className={styles.recommend}>
      <h1>러닝화 추천 받기</h1>
      <p>아래 질문에 답해주시면 당신에게 맞는 러닝화를 추천해드릴게요.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>성별</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">선택하세요</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
        </select>

        <label>러닝 목적</label>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">선택하세요</option>
          <option value="일상 러닝">일상 러닝</option>
          <option value="마라톤">마라톤</option>
          <option value="트레일">트레일</option>
          <option value="워킹">워킹</option>
        </select>

        <label>예산 (선택)</label>
        <input
          type="number"
          placeholder="예: 100000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          step={10000}
        />

        <button type="submit">추천받기</button>
      </form>
    </div>
  );
};

export default Recommend;