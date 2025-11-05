import React, { useState } from 'react';
import styles from '../../assets/css/common.module.css';

const WaterIntakeCalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            setResult('올바른 키와 체중을 입력해주세요.');
            return;
        }
        if (h > 250) {
            setResult('250cm 이하의 값을 입력해주세요.');
            return;
        }
        if (w > 300) {
            setResult('300kg 이하의 값을 입력해주세요.');
            return;
        }
        const intake = ((h + w) / 100).toFixed(2);
        setResult(`하루 권장 물 섭취량은 약 ${intake}L 입니다.`);
    };

    return (
        <div className={styles.section}>
            <h3 className={styles.subtitle}>💧 하루 물 섭취량 계산기</h3>
            <input
                type="number"
                placeholder="키 (cm)"
                value={height}
                onChange={(e) => {
                    const value = e.target.value;
                    const filtered = value.replace(/[^0-9.]/g, '');
                    if (parseFloat(filtered) > 250) return; // 250 초과 시 무시
                    setHeight(filtered);
                }}
                max="250"
                className={styles.formInput}
            />

            <input
                type="number"
                placeholder="체중 (kg)"
                value={weight}
                onChange={(e) => {
                    const value = e.target.value;
                    const filtered = value.replace(/[^0-9.]/g, '');
                    if (parseFloat(filtered) > 300) return; // 300 초과 시 무시
                    setWeight(filtered);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        calculate();
                    }
                }}
                max="300"
                className={styles.formInput}
            />
            <div className={styles.btnBox}>
                <button onClick={calculate} className={styles.btn}>
                    계산하기
                </button>
            </div>
            {result && <div className={styles.highlight}>{result}</div>}
        </div>
    );
};

export default WaterIntakeCalculator;