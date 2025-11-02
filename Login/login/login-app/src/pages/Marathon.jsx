import React, { useState } from "react";
import { MARATHON_LIST } from "../utils/marathon";
import styles from '../assets/css/Marathon.module.css';
import reset from '../assets/img/reset.png'

export default function MarathonList() {
    // 기본값 정의
    const defaultSearch = "";
    const defaultType = "전체";
    const defaultStatus = "접수중";

    const [search, setSearch] = useState(defaultSearch);
    const [type, setType] = useState(defaultType);
    const [statusFilter, setStatusFilter] = useState(defaultStatus);

    const getMarathonStatus = (marathon) => {
        if (marathon.firstComeFirstServed) return "선착순 접수중";
        const today = new Date();
        const start = new Date(marathon.startDate);
        const end = new Date(marathon.endDate);
        const race = new Date(marathon.raceDate);

        if (today < start) return "접수대기";
        if (today >= start && today <= end) return "접수중";
        if (today > end && today < race) return "접수마감";
        if (today >= race) return "종료";
    };

    // 상태별 색상 맵
    const statusClassMap = {
        "접수대기": styles.badgeWait,
        "접수중": styles.badgeOpen,
        "선착순 접수중": styles.badgeFirstCome,
        "접수마감": styles.badgeClosed,
        "종료": styles.badgeFinished,
    };

    const typeOptions = ["전체", "Full", "Half", "10Km", "5Km"];
    const statusOptions = ["전체", "접수대기", "접수중", "접수마감", "종료"];

    // 상태 그룹 정의 (접수중 필터 시 "선착순 접수중" 포함)
    const statusGroups = {
        "접수중": ["접수중", "선착순 접수중"],
        "접수대기": ["접수대기"],
        "접수마감": ["접수마감"],
        "종료": ["종료"],
    };

    // 필터 초기화 함수
    const resetFilters = () => {
        setSearch(defaultSearch);
        setType(defaultType);
        setStatusFilter(defaultStatus);
    };

    const filtered = MARATHON_LIST
        .map(m => ({ ...m, status: getMarathonStatus(m) }))
        .filter(m => {
            const matchText = m.title.includes(search) || m.location.includes(search);
            const matchType = type === "전체" ? true : m.type.includes(type);

            const matchStatus = statusFilter === "전체"
                ? true
                : statusGroups[statusFilter].includes(m.status);

            return matchText && matchType && matchStatus;
        });

    return (
        <div className={styles.marathonContainer}>
            <h1 className={styles.marathonTitle}>마라톤 일정</h1>

            {/* 검색 + 종목 필터 + 초기화 버튼 */}
            <div className={styles.filterBox}>
                <input
                    className={styles.searchInput}
                    placeholder="검색 (대회명/지역)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className={styles.selectBox}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    {typeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            {/* 상태 버튼 필터 */}
            <div className={styles.buttonFilter} style={{ marginTop: "10px" }}>
                {statusOptions.map(s => (
                    <button
                        key={s}
                        className={`${styles.typeBtn} ${statusFilter === s ? styles.active : ""}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s}
                    </button>
                ))}
                <button className={styles.resetBtn} onClick={resetFilters}>
                    <img src={reset} alt="초기화" className={styles.resetIcon} />
                    초기화
                </button>
            </div>

            {/* 마라톤 카드 */}
            <div className={styles.marathonList}>
                {filtered.map(m => (
                    <a
                        key={m.id}
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.card}
                    >
                        <div className={styles.cardTitle}>{m.title}</div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardInfo}>
                                📍 {m.location} · 📅 {m.raceDate}
                            </div>

                            <div className={styles.cardType}>
                                🏃 {m.type.join(" / ")}
                            </div>

                            <div className={`${styles.cardStatus} ${statusClassMap[m.status]}`}>
                                {m.status}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
