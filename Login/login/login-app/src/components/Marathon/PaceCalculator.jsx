import React, { useState, useMemo } from 'react';
import { Gauge, Clock, Zap, Target, ChevronDown, ChevronUp, Copy, Check, Flame } from 'lucide-react';
import Swal from 'sweetalert2';
import './PaceCalculator.css';

const DISTANCE_PRESETS = [
    { label: '5 km', km: 5.0, popularTimes: [{ h: 0, m: 25, s: 0, name: '25Î∂?(5:00/km)' }, { h: 0, m: 30, s: 0, name: '30Î∂?(6:00/km)' }, { h: 0, m: 35, s: 0, name: '35Î∂?(7:00/km)' }] },
    { label: '10 km', km: 10.0, popularTimes: [{ h: 0, m: 45, s: 0, name: '45Î∂?(4:30/km)' }, { h: 0, m: 50, s: 0, name: '50Î∂?(5:00/km)' }, { h: 1, m: 0, s: 0, name: '60Î∂?(6:00/km)' }] },
    { label: '?òÌîÑ (21.0975km)', km: 21.0975, popularTimes: [{ h: 1, m: 40, s: 0, name: '1?úÍ∞Ñ 40Î∂? }, { h: 1, m: 50, s: 0, name: '1?úÍ∞Ñ 50Î∂? }, { h: 2, m: 0, s: 0, name: '2?úÍ∞Ñ (5:41/km)' }] },
    { label: '?ÄÏΩîÏä§ (42.195km)', km: 42.195, popularTimes: [{ h: 2, m: 59, s: 59, name: 'Sub-3 (2:59)' }, { h: 3, m: 30, s: 0, name: 'Sub-3.5 (3:30)' }, { h: 4, m: 0, s: 0, name: 'Sub-4 (4:00)' }, { h: 4, m: 30, s: 0, name: '4?úÍ∞Ñ 30Î∂? }] },
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

    // ?§Ï†ú Í±∞Î¶¨ km Í≥ÑÏÇ∞
    const currentDistanceKm = useMemo(() => {
        if (selectedPreset === 'custom') {
            const parsed = parseFloat(customKm);
            return isNaN(parsed) || parsed <= 0 ? 10 : parsed;
        }
        const preset = DISTANCE_PRESETS.find(p => p.label === selectedPreset);
        return preset ? preset.km : 10;
    }, [selectedPreset, customKm]);

    // Ï¥??úÍ∞Ñ(Ï¥?
    const totalSeconds = useMemo(() => {
        const h = parseInt(hours, 10) || 0;
        const m = parseInt(minutes, 10) || 0;
        const s = parseInt(seconds, 10) || 0;
        return h * 3600 + m * 60 + s;
    }, [hours, minutes, seconds]);

    // 1km???òÏù¥??Î∞??úÏÜç Í≥ÑÏÇ∞
    const paceStats = useMemo(() => {
        if (totalSeconds <= 0 || currentDistanceKm <= 0) {
            return { paceMin: 0, paceSec: 0, speedKmh: '0.0', track400mSec: 0, estCalories: 0 };
        }

        const secPerKm = totalSeconds / currentDistanceKm;
        const paceMin = Math.floor(secPerKm / 60);
        const paceSec = Math.round(secPerKm % 60);
        const speedKmh = ((currentDistanceKm / (totalSeconds / 3600))).toFixed(1);
        const track400mSec = Math.round((secPerKm * 0.4));
        // ?Ä??Ï≤¥Ï§ë 65kg Í∏∞Ï? ÎßàÎùº???åÎ™® ÏπºÎ°úÎ¶?(km * Ï≤¥Ï§ë * 1.036)
        const estCalories = Math.round(currentDistanceKm * 65 * 1.036);

        return { paceMin, paceSec, speedKmh, track400mSec, estCalories };
    }, [totalSeconds, currentDistanceKm]);

    // 5km ?®ÏúÑ ?§ÌîåÎ¶??åÏù¥Î∏??ùÏÑ±
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

        // ?ÑÏ£º ÏßÄ??(Finish)
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

    // ?ÑÎ¶¨??Î™©Ìëú?úÍ∞Ñ ?§Ï†ï
    const handleSetTime = (h, m, s) => {
        setHours(String(h));
        setMinutes(String(m));
        setSeconds(String(s));
    };

    // ?§ÌîåÎ¶??Ä???çÏä§??Î≥µÏÇ¨
    const handleCopySplits = () => {
        if (!splitTable.length) return;
        const lines = [
            `?èÉ [?êÎü¨?? Î™©Ìëú ?òÏù¥??& ?§ÌîåÎ¶??Ä??Í≥ÑÌöç`,
            `Í±∞Î¶¨: ${currentDistanceKm} km | Î™©Ìëú ?úÍ∞Ñ: ${hours}??${minutes}Î∂?${seconds}Ï¥?,
            `?âÍ∑† ?òÏù¥?? ${paceStats.paceMin}'${String(paceStats.paceSec).padStart(2, '0')}"/km (?úÏÜç ${paceStats.speedKmh} km/h)`,
            `------------------------`,
            ...splitTable.map(s => `${s.distLabel} ??${s.cumulativeTime}`),
            `------------------------`,
            `?êÎü¨?ùÏóê??Í≥ÑÏÇ∞?? https://www.dorunning.app`
        ];
        navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Íµ¨Í∞ÑÎ≥??§ÌîåÎ¶??Ä?ÑÏù¥ Î≥µÏÇ¨?òÏóà?µÎãà??',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const currentPresetObj = DISTANCE_PRESETS.find(p => p.label === selectedPreset);

    return (
        <div className="content-card-box pace-calculator-card">
            <div className="card-heading-title-row">
                <h2 className="card-heading-title" style={{ margin: 0 }}>
                    <Gauge size={22} className="text-primary-blue" /> ?¨ÎÑà Î™©Ìëú ?òÏù¥??& ?§ÌîåÎ¶?Í≥ÑÏÇ∞Í∏?                </h2>
                <span className="pace-sub-badge">Race Pace</span>
            </div>

            <p className="pace-calc-intro">
                Î™©Ìëú ?ÑÏ£º ?úÍ∞ÑÍ≥?Ï¢ÖÎ™©???†ÌÉù?òÎ©¥ <strong>1km???ÑÏöî ?òÏù¥??/strong>?Ä <strong>5km ?®ÏúÑ ?µÍ≥º ?úÍ∞Ñ(Split)</strong>??Ï¶âÏãú ?∞Ï∂ú?©Îãà??
            </p>

            {/* Í±∞Î¶¨ ?ÑÎ¶¨??Î≤ÑÌäº */}
            <div className="pace-distance-selector">
                <span className="selector-label"><Target size={14} /> Ï¢ÖÎ™© ?†ÌÉù</span>
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
                        ÏßÅÏ†ë ?ÖÎ†•
                    </button>
                </div>

                {selectedPreset === 'custom' && (
                    <div className="custom-km-input-row">
                        <label>ÏßÅÏ†ë Í±∞Î¶¨ ?ÖÎ†• (km):</label>
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

            {/* Î™©Ìëú ?úÍ∞Ñ ?ÖÎ†• & Îπ†Î•∏ ?ÑÎ¶¨??*/}
            <div className="pace-time-input-section">
                <span className="selector-label"><Clock size={14} /> Î™©Ìëú ?ÑÏ£º ?úÍ∞Ñ ?ÖÎ†•</span>
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
                        <span className="unit-label">?úÍ∞Ñ</span>
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
                        <span className="unit-label">Î∂?/span>
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
                        <span className="unit-label">Ï¥?/span>
                    </div>
                </div>

                {/* ?∏Í∏∞ Î™©Ìëú Í∏∞Î°ù ?êÌÅ¥Î¶??ÑÎ¶¨??*/}
                {currentPresetObj && currentPresetObj.popularTimes && (
                    <div className="popular-times-row">
                        <span className="popular-label">Ï∂îÏ≤ú Î™©Ìëú:</span>
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

            {/* Í≤∞Í≥º ?Ä?úÎ≥¥??Ïπ¥Îìú */}
            <div className="pace-result-summary-grid">
                <div className="pace-stat-card highlight">
                    <span className="stat-card-title"><Zap size={16} /> Î™©Ìëú 1km ?òÏù¥??/span>
                    <div className="stat-card-big-value">
                        {paceStats.paceMin}<span>Î∂?/span> {String(paceStats.paceSec).padStart(2, '0')}<span>Ï¥?/span>
                        <small>/ km</small>
                    </div>
                    <span className="stat-card-sub">
                        400m ?∏Îûô 1Î∞îÌÄ???<strong>{paceStats.track400mSec}Ï¥?/strong>
                    </span>
                </div>

                <div className="pace-stat-card">
                    <span className="stat-card-title"><Gauge size={16} /> ?âÍ∑† Ï£ºÌñâ ?çÎèÑ</span>
                    <div className="stat-card-big-value">
                        {paceStats.speedKmh} <small>km/h</small>
                    </div>
                    <span className="stat-card-sub">?¨Îãù Î®∏Ïã† ?∏Î†à?úÎ? ?çÎèÑ ?§Ï†ï Í∏∞Ï?</span>
                </div>

                <div className="pace-stat-card">
                    <span className="stat-card-title"><Flame size={16} /> ?àÏÉÅ ?åÎ™® ?¥Îüâ</span>
                    <div className="stat-card-big-value">
                        ~{paceStats.estCalories.toLocaleString()} <small>kcal</small>
                    </div>
                    <span className="stat-card-sub">Ï≤¥Ï§ë 65kg Í∏∞Ï? (Í∏∞Ï¥à ?Ä????</span>
                </div>
            </div>

            {/* 5km ?®ÏúÑ ?§ÌîåÎ¶??åÏù¥Î∏??ÑÏΩî?îÏñ∏ */}
            {splitTable.length > 0 && (
                <div className="split-table-wrapper">
                    <div className="split-table-header" onClick={() => setShowSplitTable(!showSplitTable)}>
                        <div className="split-title-left">
                            <Clock size={16} />
                            <span>Íµ¨Í∞ÑÎ≥??àÏÉÅ ?µÍ≥º ?úÍ∞Ñ (5km Split Table)</span>
                            <span className="split-count-badge">{splitTable.length}Í∞?Íµ¨Í∞Ñ</span>
                        </div>
                        <div className="split-actions-right">
                            <button
                                type="button"
                                className="split-copy-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopySplits();
                                }}
                                title="?§ÌîåÎ¶??åÏù¥Î∏??çÏä§??Î≥µÏÇ¨"
                            >
                                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                <span>{copied ? 'Î≥µÏÇ¨?? : 'Íµ¨Í∞Ñ Í∏∞Î°ù Î≥µÏÇ¨'}</span>
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
