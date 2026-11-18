import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "../assets/css/marathon.css";
import "../assets/css/auth.css";
import {
    Search,
    MapPin,
    Calendar,
    Footprints,
    RotateCcw,
    Award,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import Skeleton from "../components/Common/Skeleton";
import {
    normalizeMarathon,
    getMarathonStatus,
    compareUpcomingFirst,
    getTodayKstStr,
    getTwoMonthsAgoKstStr,
    STATUS_CLASS_MAP,
    STATUS_FILTER_GROUPS,
} from "../utils/marathonHelpers";

export default function MarathonList() {
    const defaultSearch = "";
    const defaultType = "?ÑÏ≤¥";
    const defaultStatus = "?ÑÏ≤¥"; // ?ÑÏ≤¥ = ?àÏ†ï Î∞?2???¥ÎÇ¥ Ï¢ÖÎ£å ?Ä???¨Ìï® ?ÑÏ≤¥ Î™©Î°ù

    const [marathons, setMarathons] = useState([]); // APIÎ°?Î∞õÏïÑ???ÅÌÉú Ï∂îÍ?
    const [search, setSearch] = useState(defaultSearch);
    const [type, setType] = useState(defaultType);
    const [statusFilter, setStatusFilter] = useState(defaultStatus);
    const [regionFilter, setRegionFilter] = useState("?ÑÏ≤¥");
    const [loading, setLoading] = useState(true); // Î°úÎî© ?ÅÌÉú Ï∂îÍ?
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const listTopRef = useRef(null);

    const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

    // Fisher-Yates ?îÌîå (?òÏù¥ÏßÄ ÏßÑÏûÖ ??1???úÎç§ ?ïÎ†¨)
    const shuffleArray = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // --- 1. Supabase ÏßÅÏ†ë ?∏Ï∂ú (Ï¢ÖÎ£å 2???¥ÎÇ¥ Î∞??•ÌõÑ ?Ä?? ---
    useEffect(() => {
        const twoMonthsAgo = getTwoMonthsAgoKstStr();

        const fetchSize = 1000;
        let allData = [];

        const fetchPage = (offset) => {
            const url = `${SUPABASE_URL}/rest/v1/marathons`
                + `?select=id,title,location,race_date,start_date,end_date,type,link,is_first_come,poster_url,status`
                + `&race_date=gte.${twoMonthsAgo}`
                + `&status=eq.approved`
                + `&limit=${fetchSize}&offset=${offset}`;

            return fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
                    return res.json();
                })
                .then(page => {
                    allData = allData.concat(page);
                    if (page.length === fetchSize) return fetchPage(offset + fetchSize);
                    return allData;
                });
        };

        fetchPage(0)
            .then(data => {
                // ?úÎç§ ?îÌîå ?ÅÏö© ???òÏù¥ÏßÄ ?àÎ°úÍ≥†Ïπ® ?úÎßà???úÏÑúÍ∞Ä Î∞îÎÄ?                setMarathons(shuffleArray(data.map(normalizeMarathon)));
            })
            .catch(err => {
                console.error('?∞Ïù¥??Î°úÎìú ?§Ìå®:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


    const todayStr = getTodayKstStr();
    const twoMonthsAgoStr = getTwoMonthsAgoKstStr();
    const statusClassMap = STATUS_CLASS_MAP;

    const typeOptions = ["?ÑÏ≤¥", "Full", "Half", "10Km", "5Km"];
    const statusOptions = ["?ÑÏ≤¥", "?ëÏàò ?àÏ†ï", "?ëÏàòÏ§?, "ÎßàÍ∞ê ?ÑÎ∞ï", "?ëÏàòÎßàÍ∞ê", "Ï¢ÖÎ£å"];
    const regionOptions = ["?ÑÏ≤¥", "?úÏö∏", "Í≤ΩÍ∏∞/?∏Ï≤ú", "Í∞ïÏõê", "Ï∂©Ï≤≠", "?ÑÎùº", "Í≤ΩÏÉÅ", "?úÏ£º"];

    const statusGroups = STATUS_FILTER_GROUPS;

    const resetFilters = () => {
        setSearch(defaultSearch);
        setType(defaultType);
        setStatusFilter(defaultStatus);
        setRegionFilter("?ÑÏ≤¥");
    };

    // --- 2. ?ÑÌÑ∞Îß?Î°úÏßÅ (marathons ?ÅÌÉúÍ∞??¨Ïö©) ---
    const filtered = marathons
        .map(m => ({ ...m, status: getMarathonStatus(m, todayStr) }))
        .filter(m => {
            // 0. Ï¢ÖÎ£å??ÏßÄ 2???òÏ? ?Ä?åÎäî ?úÏô∏
            if (m.raceDate && m.raceDate < twoMonthsAgoStr) {
                return false;
            }

            // 1. Í≤Ä?âÏñ¥ ?ÑÌÑ∞
            const matchText = (m.title + m.location).toLowerCase().includes(search.toLowerCase());

            // 2. Ï¢ÖÎ™©(Type) ?ÑÌÑ∞ ?òÏ†ï
            const matchType = type === "?ÑÏ≤¥"
                ? true
                : (m.type && m.type.some(t => t.toLowerCase().includes(type.toLowerCase())));

            // 3. ?ÅÌÉú ?ÑÌÑ∞ ??Í∏∞Î≥∏(?ÑÏ≤¥)?êÏÑú??2???¥ÎÇ¥ Ï¢ÖÎ£å ?Ä???¨Ìï® ?∏Ï∂ú; ?πÏ†ï ?ÅÌÉú ?†ÌÉù ???¥Îãπ ?ÅÌÉúÎß??∏Ï∂ú
            let matchStatus = true;
            if (statusFilter !== "?ÑÏ≤¥") {
                matchStatus = (statusGroups[statusFilter] || []).includes(m.status);
            }

            // 4. ÏßÄ???ÑÌÑ∞
            let matchRegion = true;
            if (regionFilter !== "?ÑÏ≤¥") {
                const loc = m.location || "";
                if (regionFilter === "Í≤ΩÍ∏∞/?∏Ï≤ú") {
                    matchRegion = loc.includes("Í≤ΩÍ∏∞") || loc.includes("?∏Ï≤ú");
                } else if (regionFilter === "Ï∂©Ï≤≠") {
                    matchRegion = loc.includes("Ï∂©ÎÇ®") || loc.includes("Ï∂©Î∂Å") || loc.includes("?Ä??) || loc.includes("?∏Ï¢Ö") || loc.includes("Ï∂©Ï≤≠");
                } else if (regionFilter === "?ÑÎùº") {
                    matchRegion = loc.includes("?ÑÎÇ®") || loc.includes("?ÑÎ∂Å") || loc.includes("Í¥ëÏ£º") || loc.includes("?ÑÎùº");
                } else if (regionFilter === "Í≤ΩÏÉÅ") {
                    matchRegion = loc.includes("Í≤ΩÎÇ®") || loc.includes("Í≤ΩÎ∂Å") || loc.includes("Î∂Ä??) || loc.includes("?ÄÍµ?) || loc.includes("?∏ÏÇ∞") || loc.includes("Í≤ΩÏÉÅ");
                } else {
                    matchRegion = loc.includes(regionFilter);
                }
            }

            return matchText && matchType && matchStatus && matchRegion;
        })
        // Í∏∞Î≥∏ ?ïÎ†¨: ?§Í??§Îäî ?Ä???∞ÏÑ†(raceDate), Ï¢ÖÎ£å???ÑÎûòÎ°?
        .sort(compareUpcomingFirst);

    // ?ÑÌÑ∞ Ï°∞Í±¥ Î≥ÄÍ≤???1?òÏù¥ÏßÄÎ°?Î¶¨ÏÖã
    useEffect(() => {
        setCurrentPage(1);
    }, [search, type, statusFilter, regionFilter, pageSize]);

    // ?òÏù¥Ïß?Í≥ÑÏÇ∞
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = filtered.slice(startIndex, startIndex + pageSize);

    // ?òÏù¥ÏßÄ Î≥ÄÍ≤??∏Îì§??(Î™©Î°ù ?ÅÎã®?ºÎ°ú Î∂Ä?úÎüΩÍ≤??§ÌÅ¨Î°?
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
        setCurrentPage(newPage);
        if (listTopRef.current) {
            listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 5Í∞??®ÏúÑ ?òÏù¥ÏßÄ Î≤àÌò∏ Î¶¨Ïä§??Í≥ÑÏÇ∞
    const getPageNumbers = () => {
        const maxPages = 5;
        let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let end = Math.min(totalPages, start + maxPages - 1);
        if (end - start + 1 < maxPages) {
            start = Math.max(1, end - maxPages + 1);
        }
        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="marathon-page">
            <Helmet>
                <title>?ÑÍµ≠ ÎßàÎùº???ºÏ†ï¬∑?ëÏàò D-Day Ï∫òÎ¶∞??(2026) | ?êÎü¨??/title>
                <meta name="description" content="2026 ?ÑÍµ≠ ÎßàÎùº?§¬∑Îü¨???Ä???ºÏ†ï Ï¥ùÏ†ïÎ¶? ?úÏö∏¬∑?òÎèÑÍ∂?Î∞?ÏßÄÎ∞?ÏßÄ??≥Ñ, Í±∞Î¶¨Î≥?10K¬∑?òÌîÑ¬∑?Ä) ?§ÏãúÍ∞??ëÏàò ?ÅÌÉú?Ä Í≥µÏãù ?†Ï≤≠ ÎßÅÌÅ¨Î•??úÍ≥≥?êÏÑú ?ïÏù∏?òÏÑ∏??" />
                <meta property="og:title" content="?ÑÍµ≠ ÎßàÎùº???ºÏ†ï¬∑?ëÏàò D-Day Ï∫òÎ¶∞??| ?êÎü¨?? />
                <meta property="og:description" content="2026 ?§Í??§Îäî ?ÑÍµ≠ ÎßàÎùº???Ä???ºÏ†ï, ?§ÏãúÍ∞??ëÏàò ?ÑÌô©, Í≥µÏãù ?†Ï≤≠ ÎßÅÌÅ¨ Ï¥ùÏ†ïÎ¶?" />
                <link rel="canonical" href="https://www.dorunning.app/marathon" />
            </Helmet>
            <header className="marathon-header">
                <h1><Award size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> ?ÑÍµ≠ ÎßàÎùº?§¬∑Îü¨???Ä???ºÏ†ï</h1>
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    ÏßÄ??∑Í±∞Î¶?∑Ï†ë???ÅÌÉúÎ°??ÑÌÑ∞?òÏÑ∏?? ?ÅÏÑ∏?êÏÑú Í≥µÏãù ?†Ï≤≠ ?òÏù¥ÏßÄÎ°?Î∞îÎ°ú ?¥Îèô?©Îãà??
                </p>
            </header>

            <div className="marathon-filters glass-card">
                <div className="search-row">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="form-control"
                            placeholder="ex) ?úÏö∏ ÎßàÎùº??
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
                            <option key={opt} value={opt}>{opt === '?ÑÏ≤¥' ? '?ÑÏ≤¥' : opt}</option>
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
                        <RotateCcw size={14} /> Ï¥àÍ∏∞??
                    </button>
                </div>

                <div className="status-row" style={{ marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '8px' }}>ÏßÄ??</span>
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

            {/* ?ÅÎã® ?¥Î∞î (Ï¥??Ä????& ?òÏù¥ÏßÄ??Í∞úÏàò ?†ÌÉù) */}
            <div className="marathon-toolbar" ref={listTopRef}>
                <div className="toolbar-count">
                    Ï¥?<strong className="count-number">{totalCount}</strong>Í∞úÏùò ÎßàÎùº???Ä??
                    {totalCount > 0 && (
                        <span className="toolbar-page-info">
                            ({currentPage} / {totalPages} ?òÏù¥ÏßÄ)
                        </span>
                    )}
                </div>
                <div className="toolbar-size-select">
                    <label htmlFor="pageSizeSelect">Î™©Î°ù Î≥¥Í∏∞:</label>
                    <select
                        id="pageSizeSelect"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="page-size-dropdown"
                    >
                        <option value={12}>12Í∞úÏî©</option>
                        <option value={24}>24Í∞úÏî©</option>
                        <option value={36}>36Í∞úÏî©</option>
                    </select>
                </div>
            </div>

            <div className="marathon-grid">
                {loading ? (
                    // Î°úÎî© Ï§ëÏùº ??8Í∞úÏùò ?§Ïºà?àÌÜ§ Ïπ¥Îìú ?úÏãú
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} type="card" />
                    ))
                ) : paginatedList.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', margin: '20px 0' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                            2026 ?ÑÍµ≠ ÎßàÎùº???Ä???∞Ïù¥?∞Î≤†?¥Ïä§ ?ïÎπÑ ?àÎÇ¥
                        </h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '1rem' }}>
                            ?îÏö± ?ïÌôï?òÍ≥† ?†Î¢∞?????àÎäî Í≥µÏãù ÎßàÎùº???Ä???ïÎ≥¥Î•??úÍ≥µ?òÍ∏∞ ?ÑÌï¥<br />
                            ?∞Ïù¥???åÏù¥?ÑÎùº??Î∞??úÌú¥ Í≤ÄÏ¶?Í∞úÌé∏ ?ëÏóÖ??ÏßÑÌñâ?òÍ≥† ?àÏäµ?àÎã§.<br />
                            ?àÎ°≠Í≤??ïÎèà??2026/2027 ?Ä???ºÏ†ï?ºÎ°ú Í≥??ÖÎç∞?¥Ìä∏???àÏ†ï?ÖÎãà??
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/marathon/register" className="btn-primary" style={{ padding: '10px 22px', borderRadius: '8px', textDecoration: 'none', background: '#10b981' }}>
                                + ??ÎßàÎùº???ºÏ†ï ÏßÅÏ†ë ?±Î°ù?òÍ∏∞
                            </Link>
                            <Link to="/guide" className="btn-secondary" style={{ padding: '10px 22px', borderRadius: '8px', textDecoration: 'none' }}>
                                ?¨Îãù Í∞Ä?¥Îìú & ?àÎ†® ??Î≥¥Í∏∞
                            </Link>
                            <Link to="/course" className="btn-secondary" style={{ padding: '10px 22px', borderRadius: '8px', textDecoration: 'none' }}>
                                ?ÑÍµ≠ ?¨Îãù ÏΩîÏä§ ?òÎü¨Î≥¥Í∏∞
                            </Link>
                        </div>
                    </div>
                ) : (
                    paginatedList.map(m => (
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

            {/* ?òÏù¥ÏßÄ?§Ïù¥??Ïª®Ìä∏Î°?Î∞?*/}
            {!loading && totalPages > 1 && (
                <div className="marathon-pagination-area">
                    <button
                        type="button"
                        className="page-nav-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        title="Ï≤??òÏù¥ÏßÄ"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        type="button"
                        className="page-nav-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="?¥Ï†Ñ ?òÏù¥ÏßÄ"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="page-numbers-group">
                        {getPageNumbers().map(p => (
                            <button
                                key={p}
                                type="button"
                                className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                                onClick={() => handlePageChange(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="page-nav-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="?§Ïùå ?òÏù¥ÏßÄ"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        type="button"
                        className="page-nav-btn"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="ÎßàÏ?Îß??òÏù¥ÏßÄ"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            )}

            {!loading && totalCount === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                    <Search size={48} style={{ margin: '0 auto 16px' }} />
                    <h3>Ï°∞Í±¥??ÎßûÎäî ?Ä?åÍ? ?ÜÏäµ?àÎã§. ?ÑÌÑ∞Î•??ìÌûàÍ±∞ÎÇò ?§Î•∏ ?¨ÏùÑ ?ïÏù∏??Î≥¥ÏÑ∏??</h3>
                </div>
            )}
        </div>
    );
}