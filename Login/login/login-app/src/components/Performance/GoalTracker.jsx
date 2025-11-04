import React, { useState, useEffect } from 'react';
import { saveGoal, getGoals, deleteGoal } from '../../apis/performance';
import styles from '../../assets/css/common.module.css';
import Swal from "sweetalert2";

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


const GoalTracker = () => {
  const [goal, setGoal] = useState({ title: '', target_value: '', unit: 'km' });
  const [goals, setGoals] = useState([]);

  const user_no = getUserNoFromJWT();


  const handleChange = (e) => {
    setGoal({ ...goal, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    console.log("저장 직전 goal 데이터:", goal);
    e.preventDefault();
    try {
      await saveGoal(goal, user_no);

      await Swal.fire({
        icon: "success",
        title: "저장 완료!",
        text: "목표가 성공적으로 저장되었습니다."
      });

      setGoal({ title: '', target_value: '', unit: 'km' });
      const res = await getGoals(user_no);
      setGoals(res.data);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: "목표 저장 중 오류가 발생했습니다."
      });
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 후 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGoal(id, user_no);

      await Swal.fire({
        icon: "success",
        title: "삭제 완료",
        text: "목표가 삭제되었습니다."
      });

      const res = await getGoals(user_no);
      setGoals(res.data);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "삭제 실패",
        text: "목표 삭제 중 오류가 발생했습니다."
      });
      console.error(err);
    }
  };

  useEffect(() => {
    getGoals(user_no).then((res) => setGoals(res.data));
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🎯 러닝 목표 설정</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="목표 제목"
          value={goal.title}
          onChange={handleChange}
          className={styles.formInput}
          required
        />
        <input
          type="number"
          name="target_value"
          placeholder="목표 값"
          value={goal.target_value}
          onChange={handleChange}
          className={styles.formInput}
          required
        />
        <select name="unit" value={goal.unit} onChange={handleChange} className={styles.formInput}>
          <option value="km">km</option>
          <option value="min/km">min/km</option>
        </select>
        <div className={styles.btnBox}>
          <button type="submit" className={styles.btn}>목표 저장</button>
        </div>
      </form>

      <h3 className={styles.subtitle}>📌 저장된 목표</h3>
      <ul>
        {goals.map((g) => (
          <li key={g.id}>
            {g.title} - {g.targetValue} {g.unit}
            <button
              onClick={() => handleDelete(g.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalTracker;
