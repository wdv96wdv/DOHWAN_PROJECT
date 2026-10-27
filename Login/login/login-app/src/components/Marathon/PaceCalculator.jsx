import React, { useState, useMemo } from 'react';
import { Gauge, Clock, Zap, Target, ChevronDown, ChevronUp, Copy, Check, Flame } from 'lucide-react';
import Swal from 'sweetalert2';
import './PaceCalculator.css';

const DISTANCE_PRESETS = [
    { label: '5 km', km: 5.0, popularTimes: [{ h: 0, m: 25, s: 0, name: '25분 (5:00/km)' }, { h: 0, m: 30, s: 0, name: '30분 (6:00/km)' }, { h: 0, m: 35, s: 0, name: '35분 (7:00/km)' }] },
    { label: '10 km', km: 10.0, popularTimes: [{ h: 0, m: 45, s: 0, name: '45분 (4:30/km)' }, { h: 0, m: 50, s: 0, name: '50분 (5:00/km)' }, { h: 1, m: 0, s: 0, name: '60분 (6:00/km)' }] },
    { label: '하프 (21.0975km)', km: 21.0975, popularTimes: [{ h: 1, m: 40, s: 0, name: '1시간 40분' }, { h: 1, m: 50, s: 0, name: '1시간 50분' }, { h: 2, m: 0, s: 0, name: '2시간 (5:41/km)' }] },
    { label: '풀코스 (42.195km)', km: 42.195, popularTimes: [{ h: 2, m: 59, s: 59, name: 'Sub-3 (2:59)' }, { h: 3, m: 30, s: 0, name: 'Sub-3.5 (3:30)' }, { h: 4, m: 0, s: 0, name: 'Sub-4 (4:00)' }, { h: 4, m: 30, s: 0, name: '4시간 30분' }] },
];

const PaceCalculator = ({ initialDistance = '10 km' }) => {
    const [selectedPreset, setSelectedPreset] = useState(() => {
        const found = DISTANCE_PRESETS.find(p => p.label.toLowerCase().includes(initialDistance.toLowerCase()));
        return found ? found.label : '10 km';
    });
    const [customKm, setCustomKm] = useState('10');
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('50');
    const [seconds, setSeconds] = useState('0');
    const [showSplitTable, setShowSplitTable] = useState(true);
    const [copied, setCopied] = useState(false);

    // 실제 거리 km 계산
    const currentDistanceKm = useMemo(() => {
        if (selectedPreset === 'custom') {
            const parsed = parseFloat(customKm);
            return isNaN(parsed) || parsed <= 0 ? 10 : parsed;
        }
        const preset = DISTANCE_PRESETS.find(p => p.label === selectedPreset);
        return preset ? preset.km : 10;
    }, [selectedPreset, customKm]);

    // 총 시간(초)
    const totalSeconds = useMemo(() => {
        const h = parseInt(hours, 10) || 0;
        const m = parseInt(minutes, 10) || 0;
        const s = parseInt(seconds, 10) || 0;
        return h * 3600 + m * 60 + s;
    }, [hours, minutes, seconds]);

    // 1km당 페이스 및 시속 계산
    const paceStats = useMemo(() => {
        if (totalSeconds <= 0 || currentDistanceKm <= 0) {
            return { paceMin: 0, paceSec: 0, speedKmh: '0.0', track400mSec: 0, estCalories: 0 };
        }

        const secPerKm = totalSeconds / currentDistanceKm;
        const paceMin = Math.floor(secPerKm / 60);
        const paceSec = Math.round(secPerKm % 60);
        const speedKmh = ((currentDistanceKm / (totalSeconds / 3600))).toFixed(1);
        const track400mSec = Math.round((secPerKm * 0.4));
        // 대략 체중 65kg 기준 마라톤 소모 칼로리 (km * 체중 * 1.036)
        const estCalories = Math.round(currentDistanceKm * 65 * 1.036);

        return { paceMin, paceSec, speedKmh, track400mSec, estCalories };
    }, [totalSeconds, currentDistanceKm]);

    // 5km 단위 스플릿 테이블 생성
    const splitTable = useMemo(() => {
        if (totalSeconds <= 0 || currentDistanceKm <= 0) return [];

        const secPerKm = totalSeconds / currentDistanceKm;
        const splits = [];
        let checkpoint = 5;

        while (checkpoint < currentDistanceKm) {
            const timeAtCheck = Math.round(secPerKm * checkpoint);
            const ch = Math.floor(timeAtCheck / 3600);
            const cm = Math.floor((timeAtCheck % 3600) / 60);
            const cs = timeAtCheck % 60;
            const timeStr = `${ch > 0 ? `${ch}:` : ''}${String(cm).padStart(2, '0')}:${String(cs).padStart(2, '0')}`;

            splits.push({
                distLabel: `${checkpoint} km`,
                km: checkpoint,
                cumulativeTime: timeStr,
            });
            checkpoint += 5;
        }

        // 완주 지점 (Finish)
        const fh = Math.floor(totalSeconds / 3600);
        const fm = Math.floor((totalSeconds % 3600) / 60);
        const fs = totalSeconds % 60;
        const finishStr = `${fh > 0 ? `${fh}:` : ''}${String(fm).padStart(2, '0')}:${String(fs).padStart(2, '0')}`;

        splits.push({
            distLabel: `Finish (${currentDistanceKm.toFixed(currentDistanceKm % 1 !== 0 ? 3 : 0)} km)`,
            km: currentDistanceKm,
            cumulativeTime: finishStr,
            isFinish: true
        });

        return splits;
    }, [totalSeconds, currentDistanceKm]);

    // 프리셋 목표시간 설정
    const handleSetTime = (h, m, s) => {
        setHours(String(h));
        setMinutes(String(m));
        setSeconds(String(s));
    };

    // 스플릿 타임 텍스트 복사
    const handleCopySplits = () => {
        if (!splitTable.length) return;
        const lines = [
            `🏃 [두러닝] 목표 페이스 & 스플릿 타임 계획`,
            `거리: ${currentDistanceKm} km | 목표 시간: ${hours}시 ${minutes}분 ${seconds}초`,
            `평균 페이스: ${paceStats.paceMin}'${String(paceStats.paceSec).padStart(2, '0')}"/km (시속 ${paceStats.speedKmh} km/h)`,
            `------------------------`,
            ...splitTable.map(s => `${s.distLabel} ➔ ${s.cumulativeTime}`),
            `------------------------`,
            `두러닝에서 계산됨: https://dorunning.app`
        ];
        navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '구간별 스플릿 타임이 복사되었습니다!',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const currentPresetObj = DISTANCE_PRESETS.find(p => p.label === selectedPreset);

    return (
        <div className="content-card-box pace-calculator-card">
            <div className="card-heading-title-row">
                <h2 className="card-heading-title" style={{ margin: 0 }}>
                    <Gauge size={22} className="text-primary-blue" /> 러너 목표 페이스 & 스플릿 계산기
                </h2>
                <span className="pace-sub-badge">Race Pace</span>
            </div>

            <p className="pace-calc-intro">
                목표 완주 시간과 종목을 선택하면 <strong>1km당 필요 페이스</strong>와 <strong>5km 단위 통과 시간(Split)</strong>을 즉시 산출합니다.
            </p>

            {/* 거리 프리셋 버튼 */}
            <div className="pace-distance-selector">
                <span className="selector-label"><Target size={14} /> 종목 선택</span>
                <div className="distance-chips-row">
                    {DISTANCE_PRESETS.map((dp) => (
                        <button
                            key={dp.label}
                            type="button"
                            className={`distance-chip ${selectedPreset === dp.label ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedPreset(dp.label);
                                if (dp.popularTimes.length > 0) {
                                    const defaultT = dp.popularTimes[1] || dp.popularTimes[0];
                                    handleSetTime(defaultT.h, defaultT.m, defaultT.s);
                                }
                            }}
                        >
                            {dp.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        className={`distance-chip ${selectedPreset === 'custom' ? 'active' : ''}`}
                        onClick={() => setSelectedPreset('custom')}
                    >
                        직접 입력
                    </button>
                </div>

                {selectedPreset === 'custom' && (
                    <div className="custom-km-input-row">
                        <label>직접 거리 입력 (km):</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="100"
                            value={customKm}
                            onChange={(e) => setCustomKm(e.target.value)}
                            className="pace-number-input"
                        />
                        <span>km</span>
                    </div>
                )}
            </div>

            {/* 목표 시간 입력 & 빠른 프리셋 */}
            <div className="pace-time-input-section">
                <span className="selector-label"><Clock size={14} /> 목표 완주 시간 입력</span>
                <div className="time-inputs-cluster">
                    <div className="time-input-group">
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="pace-number-input time-box"
                        />
                        <span className="unit-label">시간</span>
                    </div>
                    <span className="time-colon">:</span>
                    <div className="time-input-group">
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="pace-number-input time-box"
                        />
                        <span className="unit-label">분</span>
                    </div>
                    <span className="time-colon">:</span>
                    <div className="time-input-group">
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                            className="pace-number-input time-box"
                        />
                        <span className="unit-label">초</span>
                    </div>
                </div>

                {/* 인기 목표 기록 원클릭 프리셋 */}
                {currentPresetObj && currentPresetObj.popularTimes && (
                    <div className="popular-times-row">
                        <span className="popular-label">추천 목표:</span>
                        {currentPresetObj.popularTimes.map((pt, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="popular-time-btn"
                                onClick={() => handleSetTime(pt.h, pt.m, pt.s)}
                            >
                                {pt.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 결과 대시보드 카드 */}
            <div className="pace-result-summary-grid">
                <div className="pace-stat-card highlight">
                    <span className="stat-card-title"><Zap size={16} /> 목표 1km 페이스</span>
                    <div className="stat-card-big-value">
                        {paceStats.paceMin}<span>분</span> {String(paceStats.paceSec).padStart(2, '0')}<span>초</span>
                        <small>/ km</small>
                    </div>
                    <span className="stat-card-sub">
                        400m 트랙 1바퀴 약 <strong>{paceStats.track400mSec}초</strong>
                    </span>
                </div>

                <div className="pace-stat-card">
                    <span className="stat-card-title"><Gauge size={16} /> 평균 주행 속도</span>
                    <div className="stat-card-big-value">
                        {paceStats.speedKmh} <small>km/h</small>
                    </div>
                    <span className="stat-card-sub">러닝 머신 트레드밀 속도 설정 기준</span>
                </div>

                <div className="pace-stat-card">
                    <span className="stat-card-title"><Flame size={16} /> 예상 소모 열량</span>
                    <div className="stat-card-big-value">
                        ~{paceStats.estCalories.toLocaleString()} <small>kcal</small>
                    </div>
                    <span className="stat-card-sub">체중 65kg 기준 (기초 대사 외)</span>
                </div>
            </div>

            {/* 5km 단위 스플릿 테이블 아코디언 */}
            {splitTable.length > 0 && (
                <div className="split-table-wrapper">
                    <div className="split-table-header" onClick={() => setShowSplitTable(!showSplitTable)}>
                        <div className="split-title-left">
                            <Clock size={16} />
                            <span>구간별 예상 통과 시간 (5km Split Table)</span>
                            <span className="split-count-badge">{splitTable.length}개 구간</span>
                        </div>
                        <div className="split-actions-right">
                            <button
                                type="button"
                                className="split-copy-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopySplits();
                                }}
                                title="스플릿 테이블 텍스트 복사"
                            >
                                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                <span>{copied ? '복사됨' : '구간 기록 복사'}</span>
                            </button>
                            {showSplitTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    </div>

                    {showSplitTable && (
                        <div className="split-table-body">
                            <div className="split-grid-cells">
                                {splitTable.map((s, idx) => (
                                    <div key={idx} className={`split-cell-item ${s.isFinish ? 'finish-cell' : ''}`}>
                                        <div className="split-cell-dist">{s.distLabel}</div>
                                        <div className="split-cell-time">{s.cumulativeTime}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaceCalculator;
