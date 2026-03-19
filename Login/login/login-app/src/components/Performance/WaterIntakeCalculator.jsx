import React, { useState } from 'react';
import "../../assets/css/performance.css";
import "../../assets/css/auth.css";
import { Droplet } from 'lucide-react';

const WaterIntakeCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return;
    const intake = ((h + w) / 100).toFixed(2);
    setResult(intake);
  };

  return (
    <div className="widget-card">
      <h3><Droplet size={18} /> HYDRATION CALC</h3>
      <div className="auth-form" style={{ gap: '12px' }}>
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="form-control"
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="form-control"
        />
        <button onClick={calculate} className="btn-auth" style={{ padding: '10px' }}>CALCULATE</button>
      </div>
      
      {result && (
        <div style={{ marginTop: '24px', padding: '20px', background: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Recommended Daily Intake</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Orbitron' }}>{result} <small>L</small></div>
        </div>
      )}
    </div>
  );
};

export default WaterIntakeCalculator;