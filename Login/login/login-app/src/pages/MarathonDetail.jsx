import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  ArrowLeft, 
  Clock, 
  Award, 
  Info, 
  CheckCircle2, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Maximize2, 
  X, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Check, 
  Flame, 
  Footprints,
  Compass,
  MessageCircle,
  Download,
  Activity,
  Zap,
  ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import Loading from '../components/Common/Loading';
import { shareKakaoMarathon } from '../utils/kakaoShare';
import { downloadIcsCalendar, getGoogleCalendarUrl } from '../utils/calendarExport';
import { 
  normalizeMarathon, 
  getMarathonStatus, 
  getTodayKstStr, 
  STATUS_CLASS_MAP 
} from '../utils/marathonHelpers';
import '../assets/css/marathon-detail.css';

const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

const MarathonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [marathon, setMarathon] = useState(null);
    const [relatedMarathons, setRelatedMarathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [liveCountdown, setLiveCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1순위: Supabase REST API 직접 조회 (초고속 로딩, 콜드스타트 없음)
                const url = `${SUPABASE_URL}/rest/v1/marathons?id=eq.${encodeURIComponent(id)}&select=*`;
                const res = await fetch(url, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                    }
                });

                if (res.ok) {
                    const rows = await res.json();
                    if (rows && rows.length > 0) {
                        const mData = rows[0];
                        setMarathon(mData);
                        if (mData.title) {
                            document.title = `${mData.title} 일정·접수·코스 정보 (공식링크) | 두러닝`;
                        }
                        fetchRelated(mData);
                        setLoading(false);
                        return;
                    }
                }

                // 2순위: 백엔드 API 폴백
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                const response = await axios.get(`${API_BASE_URL}/api/marathons/${id}`);
                setMarathon(response.data);
                if (response.data && response.data.title) {
                    document.title = `${response.data.title} 일정·접수·코스 정보 (공식링크) | 두러닝`;
                }
                fetchRelated(response.data);
            } catch (err) {
                console.error('상세 정보 로드 실패:', err);
                setError('대회 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // 연관/추천 대회 조회 (3개)
    const fetchRelated = async (currentM) => {
        try {
            const todayStr = getTodayKstStr();
            let queryUrl = `${SUPABASE_URL}/rest/v1/marathons?id=neq.${currentM.id}&race_date=gte.${todayStr}&order=race_date.asc&limit=3`;
            if (currentM.location && currentM.location !== '전국') {
                queryUrl += `&location=like.*${encodeURIComponent(currentM.location)}*`;
            }

            let rRes = await fetch(queryUrl, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });

            if (rRes.ok) {
                let rList = await rRes.json();
                if (rList && rList.length > 0) {
                    setRelatedMarathons(rList.map(normalizeMarathon));
                    return;
                }
            }

            // 폴백: 지역 무관 가장 가까운 대회 3개
            const fallbackUrl = `${SUPABASE_URL}/rest/v1/marathons?id=neq.${currentM.id}&race_date=gte.${todayStr}&order=race_date.asc&limit=3`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (fbRes.ok) {
                const fbList = await fbRes.json();
                setRelatedMarathons(fbList.map(normalizeMarathon));
            }
        } catch (e) {
            // 추천 에러는 무시
        }
    };

    // 요일 포함 날짜 포맷팅
    const formatDateWithDay = (dateStr) => {
        if (!dateStr) return '-';
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${dateStr} (${days[d.getDay()]})`;
    };

    // 기간 일수 계산
    const getPeriodDays = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? ` (총 ${diff}일간)` : '';
    };

    // D-Day 계산
    const calculateDDay = (targetDate) => {
        if (!targetDate) return '';
        const today = new Date();
        const target = new Date(targetDate);
        const diff = target - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'D-Day' : days > 0 ? `D-${days}` : `종료`;
    };

    // 실시간 라이브 초 단위 카운트다운 타이머
    useEffect(() => {
        if (!marathon?.race_date) return;
        // 대회 당일 오전 08:30 기준
        const targetTime = new Date(`${marathon.race_date}T08:30:00+09:00`).getTime();
        
        const updateCountdown = () => {
            const now = Date.now();
            const diff = targetTime - now;
            if (diff <= 0) {
                setLiveCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setLiveCountdown({ days, hours, minutes, seconds, isLive: true });
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);
        return () => clearInterval(intervalId);
    }, [marathon?.race_date]);

    // 링크 복사 핸들러
    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: '대회 상세 링크가 복사되었습니다!',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    // 카카오톡 원클릭 카드 공유 핸들러
    const handleKakaoShare = async () => {
        if (!marathon) return;
        const currentDDay = calculateDDay(marathon.race_date);
        const res = await shareKakaoMarathon({
            title: marathon.title,
            raceDate: marathon.race_date,
            location: marathon.location,
            types: marathon.type,
            dDay: currentDDay,
            posterUrl: marathon.poster_url,
            pageUrl: window.location.href
        });

        if (!res.success) {
            handleShare();
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: '카카오톡 연동 확인 중 링크가 클립보드에 복사되었습니다.',
                showConfirmButton: false,
                timer: 2500
            });
        }
    };

    // 애플 / 스마트폰 (.ics) 캘린더 파일 다운로드 핸들러
    const handleDownloadIcs = () => {
        if (!marathon) return;
        const success = downloadIcsCalendar(marathon);
        if (success) {
            Swal.fire({
                title: '캘린더 일정 파일 (.ics) 저장 완료',
                html: '<p style="font-size:0.95rem; color:#475569; margin-top:8px;">다운로드된 <strong>.ics 파일</strong>을 열면 아이폰/갤럭시/PC 캘린더에 마라톤 대회가 즉시 등록됩니다.<br><br><span style="color:#2563eb; font-weight:600;">✨ 대회 1일 전 아침 리마인더 알림 자동 설정 포함</span></p>',
                icon: 'success',
                confirmButtonColor: '#2563eb',
                confirmButtonText: '확인'
            });
        }
    };

    if (loading) {
        return (
            <div className="marathon-detail-container">
                <Helmet>
                    <title>대회 정보 불러오는 중... | 두러닝</title>
                </Helmet>
                <div style={{ padding: '120px 0', textAlign: 'center' }}>
                    <Loading text="대회 상세 정보를 안전하게 불러오고 있습니다..." />
                </div>
            </div>
        );
    }

    if (error || !marathon) {
        return (
            <div className="marathon-detail-container">
                <Helmet>
                    <title>대회 정보를 찾을 수 없습니다 | 두러닝</title>
                </Helmet>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>대회 정보를 찾을 수 없습니다</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                        존재하지 않거나 삭제된 대회 일정입니다.
                    </p>
                    <button className="cta-btn-primary" onClick={() => navigate('/marathon')}>
                        마라톤 전체 목록으로 가기
                    </button>
                </div>
            </div>
        );
    }

    const todayStr = getTodayKstStr();
    const normalized = normalizeMarathon(marathon);
    const regStatus = getMarathonStatus(normalized, todayStr);
    const statusClass = STATUS_CLASS_MAP[regStatus] || 'm-wait';
    const dDay = calculateDDay(marathon.race_date);

    const types = Array.isArray(marathon.type) 
        ? marathon.type.filter(Boolean) 
        : (marathon.type ? [marathon.type] : ['마라톤']);

    const typesStr = types.join(', ');
    const metaTitle = `${marathon.title} 일정·접수·코스 정보 (공식링크) | 두러닝`;

    const descItems = [];
    if (marathon.race_date) descItems.push(`개최일: ${marathon.race_date}`);
    if (marathon.start_date || marathon.end_date) {
        const regPeriod = [marathon.start_date, marathon.end_date].filter(Boolean).join(' ~ ');
        descItems.push(`접수: ${regPeriod}`);
    }
    if (marathon.location) descItems.push(`장소: ${marathon.location}`);
    if (typesStr) descItems.push(`종목: ${typesStr}`);

    const descDetail = descItems.length ? `[${descItems.join(' | ')}] ` : '';
    const metaDescription = `${descDetail}${marathon.title} 마라톤 상세 정보. 일정, 접수 방법, 코스 안내 및 공식 참가신청 링크를 두러닝에서 확인하세요.`;
    const ogDesc = descItems.length ? descItems.join(' · ') : `${marathon.title} 대회 일정 및 공식 신청 안내`;
    const ogImg = marathon.poster_url || "https://dorunning.app/og-image.png";

    // 타임라인 단계 계산
    const hasStarted = marathon.start_date && todayStr >= marathon.start_date;
    const hasRegClosed = marathon.end_date && todayStr > marathon.end_date;
    const hasRaceFinished = marathon.race_date && todayStr >= marathon.race_date;

    return (
        <div className="marathon-detail-container">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={`https://dorunning.app/marathon/${marathon.id}`} />

                {/* Breadcrumb Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "두러닝", "item": "https://dorunning.app" },
                            { "@type": "ListItem", "position": 2, "name": "마라톤 일정", "item": "https://dorunning.app/marathon" },
                            { "@type": "ListItem", "position": 3, "name": marathon.title, "item": `https://dorunning.app/marathon/${marathon.id}` }
                        ]
                    })}
                </script>

                {/* Google Event Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Event",
                        "name": marathon.title,
                        "description": metaDescription,
                        "startDate": marathon.race_date,
                        "endDate": marathon.race_date,
                        "eventStatus": hasRaceFinished ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
                        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                        "location": {
                            "@type": "Place",
                            "name": marathon.location,
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": marathon.location,
                                "addressRegion": marathon.location,
                                "addressCountry": "KR"
                            }
                        },
                        "image": ogImg,
                        "offers": {
                            "@type": "Offer",
                            "url": marathon.link || window.location.href,
                            "price": "0",
                            "priceCurrency": "KRW",
                            "availability": hasRegClosed ? "https://schema.org/Discontinued" : "https://schema.org/InStock",
                            "validFrom": marathon.start_date
                        },
                        "performer": {
                            "@type": "PerformingGroup",
                            "name": "대회 참가자 및 러너"
                        },
                        "organizer": {
                            "@type": "Organization",
                            "name": "두러닝",
                            "url": "https://dorunning.app"
                        }
                    })}
                </script>

                {/* Open Graph */}
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={ogDesc} />
                <meta property="og:image" content={ogImg} />
                <meta property="og:url" content={window.location.href} />

                {/* Twitter */}
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={ogDesc} />
                <meta name="twitter:image" content={ogImg} />
            </Helmet>

            {/* Top Navigation */}
            <nav className="detail-top-nav">
                <button className="detail-back-btn" onClick={() => navigate('/marathon')}>
                    <ArrowLeft size={18} /> 목록으로 돌아가기
                </button>
                <div className="detail-breadcrumbs">
                    <Link to="/">홈</Link>
                    <ChevronRight size={14} />
                    <Link to="/marathon">마라톤 일정</Link>
                    <ChevronRight size={14} />
                    <span className="current">{marathon.location || '전국'}</span>
                </div>
            </nav>

            {/* Hero Banner Section */}
            <section className="detail-hero-card">
                {marathon.poster_url && (
                    <div 
                        className="hero-backdrop-glow" 
                        style={{ backgroundImage: `url(${marathon.poster_url})` }} 
                    />
                )}

                <div className="hero-inner-layout">
                    {/* Left: Poster Image Showcase */}
                    <div 
                        className="hero-poster-wrapper"
                        onClick={() => marathon.poster_url && setIsPosterModalOpen(true)}
                        title={marathon.poster_url ? "클릭하여 포스터 크게보기" : undefined}
                    >
                        {marathon.poster_url ? (
                            <>
                                <img 
                                    src={marathon.poster_url} 
                                    alt={`${marathon.title} 포스터`}
                                    className="hero-poster-img"
                                    loading="eager"
                                />
                                <div className="poster-enlarge-overlay">
                                    <Maximize2 size={24} />
                                    <span>포스터 원본 크게보기</span>
                                </div>
                            </>
                        ) : (
                            <div className="hero-poster-placeholder">
                                <div className="placeholder-icon-circle">
                                    <Award size={36} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        {marathon.title}
                                    </p>
                                    <p style={{ fontSize: '0.8rem' }}>공식 포스터 준비 중</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Event Information & Action */}
                    <div className="hero-content">
                        <div className="hero-badges-row">
                            <span className={`badge-status ${statusClass}`}>
                                <Flame size={14} /> {regStatus}
                            </span>
                            {dDay && (
                                <span className="badge-dday">
                                    {dDay}
                                </span>
                            )}
                            {/* 실시간 초단위 카운트다운 타이머 배지 */}
                            {liveCountdown.isLive && (
                                <span className="badge-live-countdown" title="대회 당일까지 남은 시간">
                                    <span className="live-pulse-dot" />
                                    <Clock size={13} />
                                    <span>
                                        <strong>{liveCountdown.days}일</strong> {String(liveCountdown.hours).padStart(2, '0')}:{String(liveCountdown.minutes).padStart(2, '0')}:{String(liveCountdown.seconds).padStart(2, '0')} 남음
                                    </span>
                                </span>
                            )}
                            <span className="badge-tag-pill">
                                {marathon.is_first_come ? '⚡ 선착순 마감' : '📝 일반 접수'}
                            </span>
                        </div>

                        <h1 className="hero-title">{marathon.title}</h1>

                        <div className="hero-meta-strip">
                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <Calendar size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">대회 개최일</span>
                                    <span className="meta-strip-val">{formatDateWithDay(marathon.race_date)}</span>
                                </div>
                            </div>

                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <MapPin size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">개최 지역</span>
                                    <span className="meta-strip-val">{marathon.location || '전국'}</span>
                                </div>
                            </div>

                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <Footprints size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">참가 코스</span>
                                    <span className="meta-strip-val">{types.join(' · ')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hero-action-buttons">
                            {/* 1. 메인 공식 접수 CTA */}
                            {marathon.link ? (
                                <a 
                                    href={marathon.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="cta-btn-primary"
                                >
                                    공식 홈페이지 참가신청 <ExternalLink size={18} />
                                </a>
                            ) : (
                                <button className="cta-btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                    공식 접수 링크 준비 중
                                </button>
                            )}

                            {/* 2. 유틸리티 3종 버튼 그리드 (카카오 공유, 캘린더 등록, 링크 복사) */}
                            <div className="hero-sub-actions-grid">
                                <button 
                                    type="button"
                                    className="cta-btn-kakao"
                                    onClick={handleKakaoShare}
                                    title="카카오톡 단톡방 및 친구에게 대회 안내 카드 공유"
                                >
                                    <MessageCircle size={18} fill="#191919" strokeWidth={0} />
                                    <span>카카오톡 공유</span>
                                </button>

                                <button 
                                    type="button"
                                    className="cta-btn-secondary"
                                    onClick={() => setIsCalendarModalOpen(true)}
                                    title="마라톤 일정을 캘린더에 추가"
                                >
                                    <Calendar size={18} />
                                    <span>캘린더 등록</span>
                                </button>

                                <button 
                                    type="button"
                                    className="cta-btn-secondary" 
                                    onClick={handleShare}
                                    title="대회 페이지 링크 복사"
                                >
                                    {copied ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
                                    <span>{copied ? '복사 완료!' : '링크 복사'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Progress Bar Card */}
            <section className="timeline-card">
                <div className="timeline-title-row">
                    <h3><Clock size={20} /> 대회 진행 타임라인</h3>
                    <span className="timeline-status-tag">
                        {hasRaceFinished ? '대회 종료' : hasRegClosed ? '대회 준비 중' : hasStarted ? '접수 진행 중' : '접수 예정'}
                    </span>
                </div>

                <div className="timeline-steps-track">
                    {/* Step 1: 접수 시작 */}
                    <div className={`timeline-step-node ${hasStarted ? 'completed' : 'current'}`}>
                        <div className="step-circle">1</div>
                        <span className="step-info-label">접수 시작</span>
                        <span className="step-info-date">{marathon.start_date || '미정'}</span>
                    </div>

                    {/* Step 2: 접수 마감 */}
                    <div className={`timeline-step-node ${hasRegClosed ? 'completed' : (hasStarted ? 'current' : '')}`}>
                        <div className="step-circle">2</div>
                        <span className="step-info-label">접수 마감</span>
                        <span className="step-info-date">{marathon.end_date || '미정'}</span>
                    </div>

                    {/* Step 3: 대회 개최 */}
                    <div className={`timeline-step-node ${hasRaceFinished ? 'completed' : (hasRegClosed ? 'current' : '')}`}>
                        <div className="step-circle">3</div>
                        <span className="step-info-label">대회 당일</span>
                        <span className="step-info-date">{marathon.race_date || '미정'}</span>
                    </div>
                </div>
            </section>

            {/* Main Content 2-Column Grid */}
            <div className="detail-main-grid">
                {/* Left Column: Comprehensive Details */}
                <div className="detail-left-col">
                    {/* 1. 종합 안내 */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Info size={22} /> 대회 종합 안내
                        </h2>
                        <div className="details-kv-table">
                            <div className="details-kv-row">
                                <span className="kv-key"><Calendar size={16} /> 개최 일시</span>
                                <span className="kv-value">{formatDateWithDay(marathon.race_date)}</span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><Clock size={16} /> 접수 기간</span>
                                <span className="kv-value">
                                    {marathon.start_date && marathon.end_date 
                                        ? `${marathon.start_date} ~ ${marathon.end_date}${getPeriodDays(marathon.start_date, marathon.end_date)}`
                                        : '주최사 공식 공지 참조'}
                                </span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><MapPin size={16} /> 개최 장소</span>
                                <span className="kv-value">{marathon.location || '전국'} (상세 코스는 공식 안내 참조)</span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><Award size={16} /> 종목 코스</span>
                                <div className="type-pills-list">
                                    {types.map((t, idx) => (
                                        <span key={idx} className="type-pill">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><CheckCircle2 size={16} /> 참가 방식</span>
                                <span className="kv-value">
                                    {marathon.is_first_come ? '선착순 조기 마감 대회 (빠른 접수 권장)' : '일반 모집 접수'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. 코스별 완주 가이드 */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Compass size={22} /> 종목별 코스 가이드
                        </h2>
                        <div className="course-guides-grid">
                            {types.map((t, idx) => {
                                const lower = t.toLowerCase();
                                let dist = '마라톤 코스';
                                let desc = '자신의 페이스에 맞춰 안전하고 즐겁게 완주를 목표로 달려보세요.';
                                if (lower.includes('full') || lower.includes('풀')) {
                                    dist = '42.195 km';
                                    desc = '철저한 장거리 지속주(LSD) 훈련과 에너지젤 보충 및 페이스 배분이 핵심입니다.';
                                } else if (lower.includes('half') || lower.includes('하프')) {
                                    dist = '21.0975 km';
                                    desc = '러너들이 가장 선호하는 거리로, 중반 이후 일정한 크루즈 페이스 유지가 중요합니다.';
                                } else if (lower.includes('10k') || lower.includes('10')) {
                                    dist = '10.0 km';
                                    desc = '입문자부터 기록 단축 러너까지 가장 대중적인 코스로 시원한 스피드를 즐기기 좋습니다.';
                                } else if (lower.includes('5k') || lower.includes('5')) {
                                    dist = '5.0 km';
                                    desc = '러닝을 처음 시작하는 비기너나 가족, 친구와 가볍게 펀런하기 가장 좋은 코스입니다.';
                                }
                                return (
                                    <div key={idx} className="course-guide-item">
                                        <div className="course-badge-name">
                                            {t}
                                            <span className="course-badge-dist">{dist}</span>
                                        </div>
                                        <p className="course-guide-desc">{desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. 러너 대회 준비 체크리스트 */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Sparkles size={22} /> 러너 대회 완주 체크리스트
                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">대회 1주 전</span>
                                <p className="checklist-desc-list">
                                    배번호 및 기념품 수령 확인, 레이스 데이에 신을 검증된 러닝화 점검, 과도한 강훈련 대신 컨디션 조절(테이퍼링).
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">대회 전날</span>
                                <p className="checklist-desc-list">
                                    신분증 및 배번호 핀 부착, 탄수화물 위주의 식사(카보로딩), 충분한 수분 섭취 및 최소 7시간 이상의 숙면 취하기.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">대회 당일</span>
                                <p className="checklist-desc-list">
                                    출발 1시간 30분 전 대회장 도착, 가벼운 조깅과 동적 스트레칭, 물품 보관 후 출발 20분 전 출발선 대기.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. 코스 페이스 배분 & 완주 전략 */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Activity size={22} /> 코스 페이스 배분 & 완주 전략
                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">초반 (0 ~ 5km)</span>
                                <p className="checklist-desc-list">
                                    <strong>오버페이스 절대 금지:</strong> 대회장의 뜨거운 열기와 인파에 휩쓸리지 않고 목표 페이스보다 10~15초 늦게 차분히 출발하여 심박수를 안정시킵니다.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">중반 (5 ~ 15km / 하프·풀)</span>
                                <p className="checklist-desc-list">
                                    <strong>크루즈 페이스 유지:</strong> 호흡과 보폭을 일정하게 정렬하고 5km마다 설치된 급수대에서 목마름을 느끼기 전에 소량씩 수분을 규칙적으로 섭취합니다.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">후반 (라스트 구간)</span>
                                <p className="checklist-desc-list">
                                    <strong>네거티브 스플릿 도전:</strong> 남아있는 체력을 바탕으로 턱을 당기고 팔치기를 의식하며 일정한 리듬을 유지해 피니시 라인까지 안정적으로 골인합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5. 레이스 영양 & 수분 보충 가이드 */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Zap size={22} /> 레이스 영양 & 수분 보충 가이드
                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">대회 3일 전</span>
                                <p className="checklist-desc-list">
                                    <strong>글리코겐 저장(카보로딩):</strong> 자극적인 음식과 기름진 식사를 피하고 쌀밥, 바나나, 고구마 등 복합 탄수화물 비중을 식단의 70%까지 늘립니다.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">대회 당일 아침</span>
                                <p className="checklist-desc-list">
                                    <strong>출발 3~4시간 전 식사:</strong> 소화가 쉬운 떡이나 베이글, 바나나 위주로 가볍게 식사하고 출발 1시간 전까지 미온수 300~500ml를 나누어 마십니다.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">레이스 중 보충</span>
                                <p className="checklist-desc-list">
                                    <strong>에너지젤 타이밍:</strong> 하프/풀코스 주자는 10km, 20km, 30km 지점 급수대 직전에 에너지젤을 섭취하고 물과 함께 넘겨 체내 흡수율을 높입니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 6. 안내 및 유의사항 */}
                    <div className="detail-trust-box">
                        <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div className="trust-box-text">
                            <strong>참가 신청 전 확인 안내</strong><br />
                            대회 일정, 코스 구성, 기념품 및 접수 마감 시간은 주최·주관사의 사정에 따라 예고 없이 변경될 수 있습니다. 
                            참가 신청 및 결제 전 반드시 아래 공식 홈페이지의 최신 공지사항을 확인해 주시기 바랍니다.
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Action & Related Widget */}
                <aside className="detail-sidebar">
                    {/* Official Hub Card */}
                    <div className="sidebar-action-card">
                        <h3 className="sidebar-title">
                            <LinkIcon size={18} /> 공식 참가 신청
                        </h3>
                        <p className="sidebar-desc">
                            공식 주최사 웹사이트로 연결됩니다. 참가 요강 및 코스도를 확인 후 접수하세요.
                        </p>
                        {marathon.link ? (
                            <a 
                                href={marathon.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="sidebar-cta-btn"
                            >
                                공식 사이트 바로가기 <ExternalLink size={18} />
                            </a>
                        ) : (
                            <button className="sidebar-cta-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                공식 접수 링크 준비 중
                            </button>
                        )}
                    </div>

                    {/* Related Marathons Widget */}
                    {relatedMarathons.length > 0 && (
                        <div className="related-widget">
                            <h3 className="sidebar-title">
                                <Award size={18} /> 함께 둘러보는 대회
                            </h3>
                            <div className="related-list">
                                {relatedMarathons.map((rm) => (
                                    <Link 
                                        key={rm.id} 
                                        to={`/marathon/${rm.id}`}
                                        className="related-item-link"
                                    >
                                        <div className="related-item-info">
                                            <span className="related-item-title">{rm.title}</span>
                                            <span className="related-item-date">
                                                <Calendar size={12} /> {rm.raceDate} · {rm.location}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Poster Fullscreen Modal */}
            {isPosterModalOpen && marathon.poster_url && (
                <div 
                    className="poster-modal-backdrop"
                    onClick={() => setIsPosterModalOpen(false)}
                >
                    <div 
                        className="poster-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="poster-modal-close-btn"
                            onClick={() => setIsPosterModalOpen(false)}
                            title="닫기"
                        >
                            <X size={20} />
                        </button>
                        <img 
                            src={marathon.poster_url} 
                            alt={`${marathon.title} 포스터 원본`}
                            className="poster-modal-img" 
                        />
                    </div>
                </div>
            )}

            {/* Calendar Integration Modal (모바일 & 데스크톱 완벽 대응) */}
            {isCalendarModalOpen && (
                <div 
                    className="cal-modal-backdrop"
                    onClick={() => setIsCalendarModalOpen(false)}
                >
                    <div 
                        className="cal-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cal-modal-header">
                            <div className="cal-modal-title-group">
                                <Calendar size={22} className="cal-modal-icon" />
                                <h3>마라톤 일정 캘린더 등록</h3>
                            </div>
                            <button 
                                className="cal-modal-close-btn"
                                onClick={() => setIsCalendarModalOpen(false)}
                                title="닫기"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="cal-modal-desc">
                            대회 일정을 캘린더에 등록하여 접수 마감과 대회 당일을 놓치지 마세요.
                        </p>

                        <div className="cal-modal-options">
                            <a 
                                href={getGoogleCalendarUrl(marathon)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cal-modal-option-btn google"
                                onClick={() => setIsCalendarModalOpen(false)}
                            >
                                <div className="cal-opt-badge google">G</div>
                                <div className="cal-opt-text">
                                    <strong>구글 캘린더에 등록</strong>
                                    <small>구글 웹 캘린더 새 창에서 바로 추가</small>
                                </div>
                                <ExternalLink size={16} className="cal-opt-arrow" />
                            </a>

                            <button 
                                type="button"
                                className="cal-modal-option-btn ics"
                                onClick={() => {
                                    setIsCalendarModalOpen(false);
                                    handleDownloadIcs();
                                }}
                            >
                                <div className="cal-opt-badge ics">
                                    <Download size={18} />
                                </div>
                                <div className="cal-opt-text">
                                    <strong>애플 / 스마트폰 캘린더 (.ics)</strong>
                                    <small>아이폰/갤럭시 기본 캘린더 자동 등록 (D-1 알림 포함)</small>
                                </div>
                                <ChevronRight size={18} className="cal-opt-arrow" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarathonDetail;
