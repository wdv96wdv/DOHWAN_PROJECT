import React, { useState, useEffect } from 'react';
import "../../assets/css/performance.css";
import { Droplet, Plus, RotateCcw, Info } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const WaterIntakeCalculator = () => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState(2.0); // Default 2L
  const [current, setCurrent] = useState(0);
  const [showSetup, setShowSetup] = useState(true);

  useEffect(() => {
    if (!userInfo?.no) return;

    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`water_${userInfo.no}_${today}`);
    if (savedData) {
      setCurrent(Number(savedData));
    }

    const savedSetup = localStorage.getItem(`water_setup_${userInfo.no}`);
    if (savedSetup) {
      const { h, w, g } = JSON.parse(savedSetup);
      setHeight(h);
      setWeight(w);
      setGoal(g);
      setShowSetup(false);
    }
  }, [userInfo]);

  const handleSetup = (e) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return;

    const calculatedGoal = parseFloat(((h + w) / 100).toFixed(1));
    setGoal(calculatedGoal);
    setShowSetup(false);

    localStorage.setItem(`water_setup_${userInfo.no}`, JSON.stringify({ h, w, g: calculatedGoal }));
  };

  const addWater = (amount) => {
    const newAmount = parseFloat((current + amount).toFixed(2));
    setCurrent(newAmount);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`water_${userInfo.no}_${today}`, newAmount);
  };

  const resetWater = () => {
    setCurrent(0);
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`water_${userInfo.no}_${today}`);
  };

  const progress = Math.min(Math.round((current / goal) * 100), 100);

  return (
    <div className="widget-card hydration-tracker">
      <div className="water-header">
        <div className="water-title">
          <Droplet size={18} className="icon-blue" />
          <span>HYDRATION</span>
        </div>
        <button className="btn-icon" onClick={() => setShowSetup(!showSetup)}>
          <Info size={16} />
        </button>
      </div>

      {showSetup ? (
        <form onSubmit={handleSetup} className="water-setup-form">
          <p className="setup-hint">Calculate your daily water goal</p>
          <div className="input-row">
            <input type="number" placeholder="Height" value={height} onChange={e => setHeight(e.target.value)} className="form-control" />
            <input type="number" placeholder="Weight" value={weight} onChange={e => setWeight(e.target.value)} className="form-control" />
          </div>
          <button type="submit" className="btn-auth">확인</button>
        </form>
      ) : (
        <div className="water-content">
          <div className="water-visual-area">
            <div className="water-bottle">
              <div className="water-fill" style={{ height: `${progress}%` }}>
                <div className="water-waves"></div>
              </div>
            </div>
            <div className="water-stats">
              <div className="current-val">{current.toFixed(1)}<span className="unit">L</span></div>
              <div className="goal-val">Goal: {goal}L</div>
            </div>
          </div>

          <div className="water-actions">
            <button className="btn-water-add" onClick={() => addWater(0.25)}>
              <Plus size={16} /> 250ml
            </button>
            <button className="btn-water-add" onClick={() => addWater(0.5)}>
              <Plus size={16} /> 500ml
            </button>
            <button className="btn-reset" onClick={resetWater}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hydration-tracker {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .water-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .water-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .icon-blue { color: #3b82f6; }
        
        .setup-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .water-setup-form .input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .water-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          animation: fadeIn 0.4s ease;
        }
        
        .water-visual-area {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
        }
        
        .water-bottle {
          width: 60px;
          height: 100px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px 8px 12px 12px;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
        }
        .water-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, #60a5fa, #3b82f6);
          transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .water-waves {
          position: absolute;
          top: -10px;
          left: -50%;
          width: 200%;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 40%;
          animation: wave 3s infinite linear;
        }
        
        @keyframes wave {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .water-stats {
          flex: 1;
        }
        .current-val {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }
        .current-val .unit {
          font-size: 1rem;
          margin-left: 4px;
          color: #3b82f6;
        }
        .goal-val {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        
        .water-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .btn-water-add {
          flex: 1;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 8px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-water-add:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }
        .btn-reset {
          width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .btn-reset:hover { color: #ef4444; }
      `}} />
    </div>
  );
};

export default WaterIntakeCalculator;