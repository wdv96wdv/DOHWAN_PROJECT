import React, { useState, useEffect } from 'react';
import { saveGoal, getGoals, deleteGoal, updateGoal } from '../../apis/performance';
import "../../assets/css/performance.css";
import "../../assets/css/auth.css";
import Swal from "sweetalert2";
import useAuthStore from '../../store/useAuthStore';
import { Target, Plus, Trash2, Edit3 } from 'lucide-react';

const GoalTracker = () => {
  const [goal, setGoal] = useState({ title: '', targetValue: '', unit: 'km' });
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);

  const userInfo = useAuthStore(state => state.userInfo);
  const user_no = userInfo?.no;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_no) return;

    try {
      if (editingGoalId) {
        await updateGoal({ ...goal, id: editingGoalId });
        Swal.fire("Updated", "Goal modified", "success");
      } else {
        await saveGoal(goal);
        Swal.fire("Saved", "New goal added", "success");
      }
      setGoal({ title: '', targetValue: '', unit: 'km' });
      setEditingGoalId(null);
      const res = await getGoals();
      setGoals(res.data);
    } catch (err) {
      Swal.fire("Error", "Action failed", "error");
    }
  };

  useEffect(() => {
    if (user_no) getGoals().then((res) => setGoals(res.data));
  }, [user_no]);

  return (
    <div className="widget-card">
      <h3><Target size={18} /> GOAL TRACKER</h3>
      <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '12px' }}>
        <input
          type="text"
          name="title"
          placeholder="Goal Title"
          value={goal.title}
          onChange={handleChange}
          className="form-control"
          required
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            name="targetValue"
            placeholder="Target"
            value={goal.targetValue}
            onChange={handleChange}
            className="form-control"
            style={{ flex: 2 }}
            required
          />
          <select name="unit" value={goal.unit} onChange={handleChange} className="form-control" style={{ flex: 1 }}>
            <option value="km">km</option>
            <option value="min/km">m/k</option>
          </select>
        </div>
        <button type="submit" className="btn-auth" style={{ padding: '10px' }}>
          {editingGoalId ? 'UPDATE' : 'ADD GOAL'}
        </button>
      </form>

      <div style={{ marginTop: '24px' }}>
        {goals.map((g) => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'hsla(0,0%,50%,0.05)', borderRadius: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{g.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{g.targetValue} {g.unit}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn-icon" onClick={() => { setEditingGoalId(g.id); setGoal({ title: g.title, targetValue: g.targetValue, unit: g.unit }); }}><Edit3 size={14} /></button>
              <button className="btn-icon delete" onClick={() => deleteGoal(g.id).then(() => getGoals().then(r => setGoals(r.data)))}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;
