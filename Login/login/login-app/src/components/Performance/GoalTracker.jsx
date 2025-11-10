import React, { useState, useEffect, useContext } from 'react';
import { saveGoal, getGoals, deleteGoal, updateGoal } from '../../apis/performance';
import styles from '../../assets/css/common.module.css';
import Swal from "sweetalert2";
import { LoginContext } from '../../contexts/LoginContextProvider'; // LoginContext import

const GoalTracker = () => {
  const [goal, setGoal] = useState({ title: '', target_value: '', unit: 'km' });
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);

  const { userInfo } = useContext(LoginContext); // userInfo 가져오기
  const user_no = userInfo?.no; // userInfo.no를 user_no 변수에 할당

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "target_value") {
      let num = Number(value);
      if (isNaN(num)) num = 0;
      if (num > 10000) num = 10000;
      if (num < 0) num = 0;
      setGoal(prev => ({ ...prev, [name]: num }));
    } else {
      setGoal(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_no) {
      Swal.fire({
        title: '오류',
        text: '로그인 정보가 없습니다. 다시 로그인해주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }

    const targetValue = Number(goal.target_value);

    // 클라이언트 검증
    if (isNaN(targetValue) || targetValue < 0 || targetValue > 10000) {
      return Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: "목표 값은 0 이상 10000 이하의 숫자여야 합니다."
      });
    }

    try {
      if (editingGoalId) {
        await updateGoal({ ...goal, id: editingGoalId }, user_no);
        await Swal.fire({
          icon: "success",
          title: "수정 완료!",
          text: "목표가 성공적으로 수정되었습니다."
        });
      } else {
        await saveGoal(goal, user_no);
        await Swal.fire({
          icon: "success",
          title: "저장 완료!",
          text: "목표가 성공적으로 저장되었습니다."
        });
      }

      setGoal({ title: '', target_value: '', unit: 'km' });
      setEditingGoalId(null);
      const res = await getGoals(user_no);
      setGoals(res.data);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: editingGoalId ? "수정 실패" : "저장 실패",
        text: err.message || "목표 처리 중 오류가 발생했습니다."
      });
      console.error(err);
    }
  };

  const handleEdit = (g) => {
    setEditingGoalId(g.id);
    setGoal({ title: g.title, target_value: g.targetValue, unit: g.unit });
  };

  const handleDelete = async (id) => {
    if (!user_no) {
      Swal.fire({
        title: '오류',
        text: '로그인 정보가 없습니다. 다시 로그인해주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }

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
    if (user_no) {
      getGoals(user_no).then((res) => setGoals(res.data));
    } else {
      setGoals([]);
    }
  }, [user_no]);

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
          maxLength={30}
          required
        />
        <input
          type="number"
          name="target_value"
          placeholder="목표 값"
          value={goal.target_value}
          onChange={handleChange}
          className={styles.formInput}
          max="10000"
          min="0"
          step="1"
          required
        />
        <select name="unit" value={goal.unit} onChange={handleChange} className={styles.formInput}>
          <option value="km">km</option>
          <option value="min/km">min/km</option>
        </select>
        <div className={styles.btnBox}>
          <button type="submit" className={styles.btn}>{editingGoalId ? '수정' : '저장'}</button>
          {editingGoalId && (
            <button type="button" className={styles.btn} onClick={() => { setEditingGoalId(null); setGoal({ title: '', target_value: '', unit: 'km' }); }}>취소</button>
          )}
        </div>
      </form>

      <h3 className={styles.subtitle}>📌 저장된 목표</h3>
      <ul>
        {goals.map((g) => (
          <li key={g.id}>
            {g.title} - {g.targetValue} {g.unit}
            <button
              onClick={() => handleEdit(g)}
              style={{ marginLeft: "10px" }}
            >
              수정
            </button>
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
