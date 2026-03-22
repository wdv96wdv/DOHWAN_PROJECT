import React, { useState, useEffect } from "react"; // useEffect 추가
import "../assets/css/marathon.css";
import "../assets/css/auth.css";
import { Search, MapPin, Calendar, Footprints, RotateCcw, Award } from 'lucide-react';

export default function MarathonList() {
    const defaultSearch = "";
    const defaultType = "전체";
    const defaultStatus = "전체"; // 기본값을 전체로 변경하여 데이터 확인 용이하게 설정

    const [marathons, setMarathons] = useState([]); // API로 받아올 상태 추가
    const [search, setSearch] = useState(defaultSearch);
    const [type, setType] = useState(defaultType);
    const [statusFilter, setStatusFilter] = useState(defaultStatus);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // --- 1. 백엔드 API 호출 ---
    // MarathonList.js 내부 useEffect
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/marathons`)
            .then(res => res.json())
            .then(data => {
                console.log("Raw Data from Backend:", data); // 데이터 구조 확인용 로그
                const formattedData = data.map(m => {
                    // 날짜가 배열 [2026, 3, 23] 형태로 올 경우를 대비한 처리
                    const formatRawDate = (date) => {
                        if (Array.isArray(date)) {
                            return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
                        }
                        return date; // 이미 문자열이면 그대로 반환
                    };

                    return {
                        id: m.id,
                        title: m.title,
                        link: m.link,
                        location: m.location,
                        raceDate: formatRawDate(m.race_date),
                        startDate: formatRawDate(m.start_date),
                        endDate: formatRawDate(m.end_date),
                        type: Array.isArray(m.type) ? m.type : ["마라톤"],
                        firstComeFirstServed: m.is_first_come || false
                    };
                });
                setMarathons(formattedData);
                setLoading(false);
            })
            .catch(err => {
                console.error("데이터 로드 실패:", err);
                setLoading(false);
            });
    }, []);

    const getMarathonStatus = (marathon) => {
        const today = new Date();
        const start = new Date(marathon.startDate);
        const end = new Date(marathon.endDate);
        const race = new Date(marathon.raceDate);

        if (today < start) return "접수대기";
        if (today >= start && today <= end) {
            return marathon.firstComeFirstServed ? "선착순 접수중" : "접수중";
        }
        if (today > end && today < race) return "접수마감";
        if (today >= race) return "종료";
        return "상태불명";
    };

    const statusClassMap = {
        "접수대기": "m-wait",
        "접수중": "m-open",
        "선착순 접수중": "m-firstcome",
        "접수마감": "m-closed",
        "종료": "m-finished",
    };

    const typeOptions = ["전체", "Full", "Half", "10Km", "5Km"];
    const statusOptions = ["전체", "접수대기", "접수중", "접수마감", "종료"];

    const statusGroups = {
        "전체": [],
        "접수중": ["접수중", "선착순 접수중"],
        "접수대기": ["접수대기"],
        "접수마감": ["접수마감"],
        "종료": ["종료"],
    };

    const resetFilters = () => {
        setSearch(defaultSearch);
        setType(defaultType);
        setStatusFilter(defaultStatus);
    };

    // --- 2. 필터링 로직 (marathons 상태값 사용) ---
    const filtered = marathons
        .map(m => ({ ...m, status: getMarathonStatus(m) }))
        .filter(m => {
            // 1. 검색어 필터
            const matchText = (m.title + m.location).toLowerCase().includes(search.toLowerCase());

            // 2. 종목(Type) 필터 수정
            const matchType = type === "전체"
                ? true
                : (m.type && m.type.some(t => t.toLowerCase().includes(type.toLowerCase())));

            // 3. 상태 필터
            const matchStatus = statusFilter === "전체"
                ? true
                : statusGroups[statusFilter].includes(m.status);

            return matchText && matchType && matchStatus;
        });
    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;

    return (
        <div className="marathon-page">
            <header className="marathon-header">
                <h1><Award size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> MARATHON EVENTS</h1>
            </header>

            <div className="marathon-filters">
                <div className="search-row">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="form-control"
                            placeholder="ex) 서울 마라톤"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-control"
                        style={{ width: '180px' }}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {typeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt === '전체' ? '전체' : opt}</option>
                        ))}
                    </select>
                </div>

                <div className="status-row">
                    {statusOptions.map(s => (
                        <button
                            key={s}
                            className={`status-btn ${statusFilter === s ? "active" : ""}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === '전체' ? 'ALL' : s.toUpperCase()}
                        </button>
                    ))}
                    <button className="btn-reset" onClick={resetFilters}>
                        <RotateCcw size={14} /> RESET
                    </button>
                </div>
            </div>

            <div className="marathon-grid">
                {filtered.map(m => (
                    <a
                        key={m.id || m.link} // id가 없을 경우 link를 키로 사용
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="marathon-card"
                    >
                        <div className={`m-badge ${statusClassMap[m.status]}`}>
                            {m.status}
                        </div>

                        <div className="m-title">{m.title}</div>

                        <div className="m-info-group">
                            <div className="m-info-item">
                                <MapPin size={16} color="var(--primary)" />
                                <span>{m.location}</span>
                            </div>
                            <div className="m-info-item">
                                <Calendar size={16} color="var(--primary)" />
                                <span>{m.raceDate}</span>
                            </div>
                            <div className="m-info-item" style={{ marginTop: '8px' }}>
                                <Footprints size={16} color="var(--text-muted)" />
                                <span style={{ fontWeight: 600 }}>{m.type.join(" / ")}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                    <Search size={48} style={{ margin: '0 auto 16px' }} />
                    <h3>No events match your search.</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    );
}