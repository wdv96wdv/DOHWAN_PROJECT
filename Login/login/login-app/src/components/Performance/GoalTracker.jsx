import React, { useState, useEffect } from 'react';
import { getRunRecords } from '../../apis/performance';
import "../../assets/css/performance.css";
import { Target, Trophy, Flame, Settings } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const GoalTracker = () => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [monthlyDistance, setMonthlyDistance] = useState(0);
  const [goal, setGoal] = useState(50);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState('50');

  useEffect(() => {
    if (!userInfo?.no) return;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    getRunRecords().then(res => {
      const records = res.data || [];
      const thisMonthRecords = records.filter(r => {
        if (!r.date) return false;
        const [y, m, d] = r.date.split(' ')[0].split('-').map(Number);
        const recordDate = new Date(y, m - 1, d);
        return recordDate >= firstDayOfMonth;
      });

      const total = thisMonthRecords.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
      setMonthlyDistance(total);
    });

    const savedGoal = localStorage.getItem(`run_goal_${userInfo.no}`);
    if (savedGoal) {
      setGoal(Number(savedGoal));
      setTempGoal(savedGoal);
    }
  }, [userInfo]);

  const handleGoalUpdate = (e) => {
    e.preventDefault();
    const newGoal = Number(tempGoal);
    if (isNaN(newGoal) || newGoal <= 0) return;
    
    setGoal(newGoal);
    localStorage.setItem(`run_goal_${userInfo.no}`, newGoal);
    setIsEditing(false);
  };

  const progress = Math.min(Math.round((monthlyDistance / goal) * 100), 100);
  const remaining = Math.max(goal - monthlyDistance, 0);

  return (
    <div className="widget-card goal-tracker-v2">
      <div className="goal-header">
        <div className="goal-title">
          <Target size={18} className="icon-primary" />
          <span>MONTHLY GOAL</span>
        </div>
        <button className="btn-icon" onClick={() => setIsEditing(!isEditing)}>
          <Settings size={16} />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleGoalUpdate} className="goal-edit-form">
          <input 
            type="number" 
            value={tempGoal} 
            onChange={(e) => setTempGoal(e.target.value)}
            className="form-control"
            placeholder="Set Goal (km)"
            autoFocus
          />
          <button type="submit" className="btn-auth">SAVE</button>
        </form>
      ) : (
        <div className="goal-display">
          <div className="goal-stats">
            <span className="goal-current">{monthlyDistance.toFixed(1)}</span>
            <span className="goal-target">/ {goal} km</span>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-label">{progress}%</span>
          </div>

          <div className="goal-status">
            {progress >= 100 ? (
              <div className="status-msg success">
                <Trophy size={14} /> Goal Achieved!
              </div>
            ) : (
              <div className="status-msg">
                <Flame size={14} /> {remaining.toFixed(1)}km to go
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .goal-tracker-v2 {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .goal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .icon-primary { color: var(--primary); }
        
        .goal-edit-form {
          display: flex;
          gap: 8px;
          animation: fadeIn 0.3s ease;
        }
        
        .goal-display {
          animation: fadeIn 0.3s ease;
        }
        
        .goal-stats {
          margin-bottom: 12px;
          font-family: 'Orbitron', sans-serif;
        }
        .goal-current {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .goal-target {
          font-size: 1rem;
          color: var(--text-muted);
          margin-left: 8px;
        }
        
        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .progress-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          color: var(--primary);
          min-width: 35px;
        }
        
        .status-msg {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-msg.success { color: #4ade80; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default GoalTracker;


