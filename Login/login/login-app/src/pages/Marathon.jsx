import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "../assets/css/marathon.css";
import "../assets/css/auth.css";
import { Search, MapPin, Calendar, Footprints, RotateCcw, Award } from 'lucide-react';
import Skeleton from "../components/Common/Skeleton";
import {
    normalizeMarathon,
    getMarathonStatus,
    compareUpcomingFirst,
    getTodayKstStr,
    STATUS_CLASS_MAP,
    STATUS_FILTER_GROUPS,
} from "../utils/marathonHelpers";

export default function MarathonList() {
    const defaultSearch = "";
    const defaultType = "전체";
    const defaultStatus = "전체"; // 전체 = upcoming(+접수마감) 기본; 종료는 상태 필터로만

    const [marathons, setMarathons] = useState([]); // API로 받아올 상태 추가
    const [search, setSearch] = useState(defaultSearch);
    const [type, setType] = useState(defaultType);
    const [statusFilter, setStatusFilter] = useState(defaultStatus);
    const [regionFilter, setRegionFilter] = useState("전체");
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // --- 1. 백엔드 API 호출 ---
    // MarathonList.js 내부 useEffect
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/marathons`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                // 응답이 204 No Content이거나 본문이 빌 경우 빈 배열 반환
                if (res.status === 204) return [];
                return res.json();
            })
            .then(data => {
                setMarathons(data.map(normalizeMarathon));
            })
            .catch(err => {
                console.error("데이터 로드 실패:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const todayStr = getTodayKstStr();
    const statusClassMap = STATUS_CLASS_MAP;

    const typeOptions = ["전체", "Full", "Half", "10Km", "5Km"];
    const statusOptions = ["전체", "접수 예정", "접수중", "마감 임박", "접수마감", "종료"];
    const regionOptions = ["전체", "서울", "경기/인천", "강원", "충청", "전라", "경상", "제주"];

    const statusGroups = STATUS_FILTER_GROUPS;

    const resetFilters = () => {
        setSearch(defaultSearch);
        setType(defaultType);
        setStatusFilter(defaultStatus);
        setRegionFilter("전체");
    };

    // --- 2. 필터링 로직 (marathons 상태값 사용) ---
    const filtered = marathons
        .map(m => ({ ...m, status: getMarathonStatus(m, todayStr) }))
        .filter(m => {
            // 1. 검색어 필터
            const matchText = (m.title + m.location).toLowerCase().includes(search.toLowerCase());

            // 2. 종목(Type) 필터 수정
            const matchType = type === "전체"
                ? true
                : (m.type && m.type.some(t => t.toLowerCase().includes(type.toLowerCase())));

            // 3. 상태 필터 — 기본(전체)에서는 종료/과거 대회 숨김; "종료" 필터로만 노출
            let matchStatus = true;
            if (statusFilter === "전체") {
                matchStatus = m.status !== "종료";
            } else {
                matchStatus = (statusGroups[statusFilter] || []).includes(m.status);
            }

            // 4. 지역 필터
            let matchRegion = true;
            if (regionFilter !== "전체") {
                const loc = m.location || "";
                if (regionFilter === "경기/인천") {
                    matchRegion = loc.includes("경기") || loc.includes("인천");
                } else if (regionFilter === "충청") {
                    matchRegion = loc.includes("충남") || loc.includes("충북") || loc.includes("대전") || loc.includes("세종") || loc.includes("충청");
                } else if (regionFilter === "전라") {
                    matchRegion = loc.includes("전남") || loc.includes("전북") || loc.includes("광주") || loc.includes("전라");
                } else if (regionFilter === "경상") {
                    matchRegion = loc.includes("경남") || loc.includes("경북") || loc.includes("부산") || loc.includes("대구") || loc.includes("울산") || loc.includes("경상");
                } else {
                    matchRegion = loc.includes(regionFilter);
                }
            }

            return matchText && matchType && matchStatus && matchRegion;
        })
        // 기본 정렬: 다가오는 대회 우선(raceDate), 종료는 아래로
        .sort(compareUpcomingFirst);

    return (
        <div className="marathon-page">
            <Helmet>
                <title>전국 마라톤·러닝 대회 일정 | 두러닝</title>
                <meta name="description" content="지역·거리·접수 상태로 필터하세요. 상세에서 공식 신청 페이지로 바로 이동합니다." />
                <meta property="og:title" content="두러닝 – 전국 마라톤 대회 일정" />
                <meta property="og:description" content="서울부터 지방까지, 다가오는 러닝 대회 일정과 접수 정보를 모았습니다." />
                <link rel="canonical" href="https://dorunning.vercel.app/marathon" />
            </Helmet>
            <header className="marathon-header">
                <h1><Award size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> 전국 마라톤·러닝 대회 일정</h1>
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    지역·거리·접수 상태로 필터하세요. 상세에서 공식 신청 페이지로 바로 이동합니다.
                </p>
            </header>

            <div className="marathon-filters glass-card">
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
                            {s}
                        </button>
                    ))}
                    <button className="btn-reset" onClick={resetFilters}>
                        <RotateCcw size={14} /> 초기화
                    </button>
                </div>
                
                <div className="status-row" style={{ marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '8px' }}>지역:</span>
                    {regionOptions.map(r => (
                        <button
                            key={r}
                            className={`status-btn ${regionFilter === r ? "active" : ""}`}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => setRegionFilter(r)}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="marathon-grid">
                {loading ? (
                    // 로딩 중일 때 8개의 스켈레톤 카드 표시
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} type="card" />
                    ))
                ) : (
                    filtered.map(m => (
                        <Link
                            key={m.id || m.link}
                            to={`/marathon/${m.id}`}
                            className="marathon-card glass-card"
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
                        </Link>
                    ))
                )}
            </div>

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                    <Search size={48} style={{ margin: '0 auto 16px' }} />
                    <h3>조건에 맞는 대회가 없습니다. 필터를 넓히거나 다른 달을 확인해 보세요.</h3>
                </div>
            )}
        </div>
    );
}