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
import useAuthStore from '../store/useAuthStore';
import '../assets/css/marathon-detail.css';

const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

const MarathonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const roles = useAuthStore(state => state.roles);
    const isAdmin = Boolean(roles?.isAdmin);

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
                setError(null);

                // 1?œìœ„: Supabase REST API ì§ì ‘ ì¡°íšŒ (ì´ˆê³ ??ë¡œë”©, ì½œë“œ?¤í????†ìŒ)
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
                            document.title = `${mData.title} ?¼ì •Â·?‘ìˆ˜Â·ì½”ìŠ¤ ?•ë³´ (ê³µì‹ë§í¬) | ?ëŸ¬??;
                        }
                        fetchRelated(mData);
                        setLoading(false);
                        return;
                    }
                }

                // 2?œìœ„: ë°±ì—”??API ?´ë°±
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                const response = await axios.get(`${API_BASE_URL}/api/marathons/${id}`);
                setMarathon(response.data);
                if (response.data && response.data.title) {
                    document.title = `${response.data.title} ?¼ì •Â·?‘ìˆ˜Â·ì½”ìŠ¤ ?•ë³´ (ê³µì‹ë§í¬) | ?ëŸ¬??;
                }
                fetchRelated(response.data);
            } catch (err) {
                console.error('?ì„¸ ?•ë³´ ë¡œë“œ ?¤íŒ¨:', err);
                setError('?€???•ë³´ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // ?°ê?/ì¶”ì²œ ?€??ì¡°íšŒ (3ê°?
    const fetchRelated = async (currentM) => {
        try {
            const todayStr = getTodayKstStr();
            let queryUrl = `${SUPABASE_URL}/rest/v1/marathons?id=neq.${currentM.id}&race_date=gte.${todayStr}&order=race_date.asc&limit=3`;
            if (currentM.location && currentM.location !== '?„êµ­') {
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

            // ?´ë°±: ì§€??ë¬´ê? ê°€??ê°€ê¹Œìš´ ?€??3ê°?            const fallbackUrl = `${SUPABASE_URL}/rest/v1/marathons?id=neq.${currentM.id}&race_date=gte.${todayStr}&order=race_date.asc&limit=3`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (fbRes.ok) {
                const fbList = await fbRes.json();
                setRelatedMarathons(fbList.map(normalizeMarathon));
            }
        } catch (e) {
            // ì¶”ì²œ ?ëŸ¬??ë¬´ì‹œ
        }
    };

    // ?”ì¼ ?¬í•¨ ? ì§œ ?¬ë§·??    const formatDateWithDay = (dateStr) => {
        if (!dateStr) return '-';
        const days = ['??, '??, '??, '??, 'ëª?, 'ê¸?, '??];
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${dateStr} (${days[d.getDay()]})`;
    };

    // ê¸°ê°„ ?¼ìˆ˜ ê³„ì‚°
    const getPeriodDays = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? ` (ì´?${diff}?¼ê°„)` : '';
    };

    // D-Day ê³„ì‚°
    const calculateDDay = (targetDate) => {
        if (!targetDate) return '';
        const today = new Date();
        const target = new Date(targetDate);
        const diff = target - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'D-Day' : days > 0 ? `D-${days}` : `ì¢…ë£Œ`;
    };

    // ?¤ì‹œê°??¼ì´ë¸?ì´??¨ìœ„ ì¹´ìš´?¸ë‹¤???€?´ë¨¸
    useEffect(() => {
        if (!marathon?.race_date) return;
        // ?€???¹ì¼ ?¤ì „ 08:30 ê¸°ì?
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

    // ë§í¬ ë³µì‚¬ ?¸ë“¤??    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: '?€???ì„¸ ë§í¬ê°€ ë³µì‚¬?˜ì—ˆ?µë‹ˆ??',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    // ì¹´ì¹´?¤í†¡ ?í´ë¦?ì¹´ë“œ ê³µìœ  ?¸ë“¤??    const handleKakaoShare = async () => {
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
                title: 'ì¹´ì¹´?¤í†¡ ?°ë™ ?•ì¸ ì¤?ë§í¬ê°€ ?´ë¦½ë³´ë“œ??ë³µì‚¬?˜ì—ˆ?µë‹ˆ??',
                showConfirmButton: false,
                timer: 2500
            });
        }
    };

    // ? í”Œ / ?¤ë§ˆ?¸í° (.ics) ìº˜ë¦°???Œì¼ ?¤ìš´ë¡œë“œ ?¸ë“¤??    const handleDownloadIcs = () => {
        if (!marathon) return;
        const success = downloadIcsCalendar(marathon);
        if (success) {
            Swal.fire({
                title: 'ìº˜ë¦°???¼ì • ?Œì¼ (.ics) ?€???„ë£Œ',
                html: '<p style="font-size:0.95rem; color:#475569; margin-top:8px;">?¤ìš´ë¡œë“œ??<strong>.ics ?Œì¼</strong>???´ë©´ ?„ì´??ê°¤ëŸ­??PC ìº˜ë¦°?”ì— ë§ˆë¼???€?Œê? ì¦‰ì‹œ ?±ë¡?©ë‹ˆ??<br><br><span style="color:#2563eb; font-weight:600;">???€??1?????„ì¹¨ ë¦¬ë§ˆ?¸ë” ?Œë¦¼ ?ë™ ?¤ì • ?¬í•¨</span></p>',
                icon: 'success',
                confirmButtonColor: '#2563eb',
                confirmButtonText: '?•ì¸'
            });
        }
    };

    if (loading) {
        return (
            <div className="marathon-detail-container">
                <Helmet>
                    <title>?€???•ë³´ ë¶ˆëŸ¬?¤ëŠ” ì¤?.. | ?ëŸ¬??/title>
                </Helmet>
                <div style={{ padding: '120px 0', textAlign: 'center' }}>
                    <Loading text="?€???ì„¸ ?•ë³´ë¥??ˆì „?˜ê²Œ ë¶ˆëŸ¬?¤ê³  ?ˆìŠµ?ˆë‹¤..." />
                </div>
            </div>
        );
    }

    if (error || !marathon) {
        return (
            <div className="marathon-detail-container">
                <Helmet>
                    <title>?€???•ë³´ ?…ë°?´íŠ¸ ?ˆë‚´ | ?ëŸ¬??/title>
                </Helmet>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>?ƒ?â™‚ï¸âœ¨</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        ë§ˆë¼???€???•ë³´ ?•ë¹„ ë°??…ë°?´íŠ¸ ?ˆë‚´
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.8', maxWidth: '540px', margin: '0 auto 28px' }}>
                        ?”ìš± ?•í™•?˜ê³  ? ë¢°?????ˆëŠ” ê³µì‹ ë§ˆë¼???€???•ë³´ë¥??œê³µ?˜ê¸° ?„í•´<br />
                        ?°ì´?°ë² ?´ìŠ¤ ê°œí¸ ?‘ì—…??ì§„í–‰?˜ê³  ?ˆìŠµ?ˆë‹¤. ê³??ˆë¡œ???¼ì •?¼ë¡œ ì°¾ì•„ëµ™ê² ?µë‹ˆ??
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button className="cta-btn-primary" onClick={() => navigate('/guide')}>
                            ?¬ë‹ ê°€?´ë“œ ??ë³´ê¸°
                        </button>
                        <button className="cta-btn-secondary" onClick={() => navigate('/')}>
                            ?ˆìœ¼ë¡?ê°€ê¸?                        </button>
                    </div>
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
        : (marathon.type ? [marathon.type] : ['ë§ˆë¼??]);

    const typesStr = types.join(', ');
    const metaTitle = `${marathon.title} ?¼ì •Â·?‘ìˆ˜Â·ì½”ìŠ¤ ?•ë³´ (ê³µì‹ë§í¬) | ?ëŸ¬??;

    const descItems = [];
    if (marathon.race_date) descItems.push(`ê°œìµœ?? ${marathon.race_date}`);
    if (marathon.start_date || marathon.end_date) {
        const regPeriod = [marathon.start_date, marathon.end_date].filter(Boolean).join(' ~ ');
        descItems.push(`?‘ìˆ˜: ${regPeriod}`);
    }
    if (marathon.location) descItems.push(`?¥ì†Œ: ${marathon.location}`);
    if (typesStr) descItems.push(`ì¢…ëª©: ${typesStr}`);

    const descDetail = descItems.length ? `[${descItems.join(' | ')}] ` : '';
    const metaDescription = `${descDetail}${marathon.title} ë§ˆë¼???ì„¸ ?•ë³´. ?¼ì •, ?‘ìˆ˜ ë°©ë²•, ì½”ìŠ¤ ?ˆë‚´ ë°?ê³µì‹ ì°¸ê?? ì²­ ë§í¬ë¥??ëŸ¬?ì—???•ì¸?˜ì„¸??`;
    const ogDesc = descItems.length ? descItems.join(' Â· ') : `${marathon.title} ?€???¼ì • ë°?ê³µì‹ ? ì²­ ?ˆë‚´`;
    const ogImg = marathon.poster_url || "https://www.dorunning.app/og-image.png";

    // ?€?„ë¼???¨ê³„ ê³„ì‚°
    const hasStarted = marathon.start_date && todayStr >= marathon.start_date;
    const hasRegClosed = marathon.end_date && todayStr > marathon.end_date;
    const hasRaceFinished = marathon.race_date && todayStr >= marathon.race_date;

    return (
        <div className="marathon-detail-container">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={`https://www.dorunning.app/marathon/${marathon.id}`} />

                {/* Breadcrumb Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "?ëŸ¬??, "item": "https://www.dorunning.app" },
                            { "@type": "ListItem", "position": 2, "name": "ë§ˆë¼???¼ì •", "item": "https://www.dorunning.app/marathon" },
                            { "@type": "ListItem", "position": 3, "name": marathon.title, "item": `https://www.dorunning.app/marathon/${marathon.id}` }
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
                            "name": "?€??ì°¸ê???ë°??¬ë„ˆ"
                        },
                        "organizer": {
                            "@type": "Organization",
                            "name": "?ëŸ¬??,
                            "url": "https://www.dorunning.app"
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
                    <ArrowLeft size={18} /> ëª©ë¡?¼ë¡œ ?Œì•„ê°€ê¸?                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isAdmin && (
                        <button
                            className="detail-back-btn"
                            style={{ color: 'var(--primary)', fontWeight: 600 }}
                            onClick={() => navigate(`/marathon/edit/${id}`)}
                        >
                            ?ï¸ ?˜ì •
                        </button>
                    )}
                    <div className="detail-breadcrumbs">
                        <Link to="/">??/Link>
                        <ChevronRight size={14} />
                        <Link to="/marathon">ë§ˆë¼???¼ì •</Link>
                        <ChevronRight size={14} />
                        <span className="current">{marathon.location || '?„êµ­'}</span>
                    </div>
                </div>
            </nav>

            {marathon.status === 'pending' && (
              <div style={{ 
                background: '#fef3c7', border: '1px solid #f59e0b', 
                borderRadius: '10px', padding: '12px 16px', 
                margin: '0 0 16px', display: 'flex', 
                alignItems: 'center', gap: '8px',
                fontSize: '0.9rem', color: '#92400e'
              }}>
                <AlertCircle size={18} />
                <span>???€?ŒëŠ” ?„ì¬ <strong>ê´€ë¦¬ì ?¹ì¸ ?€ê¸?ì¤?/strong>?…ë‹ˆ?? ?¹ì¸ ??ëª©ë¡???¸ì¶œ?©ë‹ˆ??</span>
              </div>
            )}

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
                        title={marathon.poster_url ? "?´ë¦­?˜ì—¬ ?¬ìŠ¤???¬ê²Œë³´ê¸°" : undefined}
                    >
                        {marathon.poster_url ? (
                            <>
                                <img 
                                    src={marathon.poster_url} 
                                    alt={`${marathon.title} ?¬ìŠ¤??}
                                    className="hero-poster-img"
                                    loading="eager"
                                />
                                <div className="poster-enlarge-overlay">
                                    <Maximize2 size={24} />
                                    <span>?¬ìŠ¤???ë³¸ ?¬ê²Œë³´ê¸°</span>
                                </div>
                                <p className="poster-source-label">
                                    ì¶œì²˜: {marathon.title} ì£¼ìµœ ì¸?Â· <Link to="/copyright">?€?‘ê¶Œ ?•ì±…</Link>
                                </p>
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
                                    <p style={{ fontSize: '0.8rem' }}>ê³µì‹ ?¬ìŠ¤??ì¤€ë¹?ì¤?/p>
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
                            {/* ?¤ì‹œê°?ì´ˆë‹¨??ì¹´ìš´?¸ë‹¤???€?´ë¨¸ ë°°ì? */}
                            {liveCountdown.isLive && (
                                <span className="badge-live-countdown" title="?€???¹ì¼ê¹Œì? ?¨ì? ?œê°„">
                                    <span className="live-pulse-dot" />
                                    <Clock size={13} />
                                    <span>
                                        <strong>{liveCountdown.days}??/strong> {String(liveCountdown.hours).padStart(2, '0')}:{String(liveCountdown.minutes).padStart(2, '0')}:{String(liveCountdown.seconds).padStart(2, '0')} ?¨ìŒ
                                    </span>
                                </span>
                            )}
                            <span className="badge-tag-pill">
                                {marathon.is_first_come ? '??? ì°©??ë§ˆê°' : '?“ ?¼ë°˜ ?‘ìˆ˜'}
                            </span>
                        </div>

                        <h1 className="hero-title">{marathon.title}</h1>

                        <div className="hero-meta-strip">
                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <Calendar size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">?€??ê°œìµœ??/span>
                                    <span className="meta-strip-val">{formatDateWithDay(marathon.race_date)}</span>
                                </div>
                            </div>

                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <MapPin size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">ê°œìµœ ì§€??/span>
                                    <span className="meta-strip-val">{marathon.location || '?„êµ­'}</span>
                                </div>
                            </div>

                            <div className="meta-strip-item">
                                <div className="meta-icon-box">
                                    <Footprints size={18} />
                                </div>
                                <div className="meta-strip-text">
                                    <span className="meta-strip-label">ì°¸ê? ì½”ìŠ¤</span>
                                    <span className="meta-strip-val">{types.join(' Â· ')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hero-action-buttons">
                            {/* 1. ë©”ì¸ ê³µì‹ ?‘ìˆ˜ CTA */}
                            {marathon.link ? (
                                <a 
                                    href={marathon.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="cta-btn-primary"
                                >
                                    ê³µì‹ ?ˆí˜?´ì? ì°¸ê?? ì²­ <ExternalLink size={18} />
                                </a>
                            ) : (
                                <button className="cta-btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                    ê³µì‹ ?‘ìˆ˜ ë§í¬ ì¤€ë¹?ì¤?                                </button>
                            )}

                            {/* 2. ? í‹¸ë¦¬í‹° 3ì¢?ë²„íŠ¼ ê·¸ë¦¬??(ì¹´ì¹´??ê³µìœ , ìº˜ë¦°???±ë¡, ë§í¬ ë³µì‚¬) */}
                            <div className="hero-sub-actions-grid">
                                <button 
                                    type="button"
                                    className="cta-btn-kakao"
                                    onClick={handleKakaoShare}
                                    title="ì¹´ì¹´?¤í†¡ ?¨í†¡ë°?ë°?ì¹œêµ¬?ê²Œ ?€???ˆë‚´ ì¹´ë“œ ê³µìœ "
                                >
                                    <MessageCircle size={18} fill="#191919" strokeWidth={0} />
                                    <span>ì¹´ì¹´?¤í†¡ ê³µìœ </span>
                                </button>

                                <button 
                                    type="button"
                                    className="cta-btn-secondary"
                                    onClick={() => setIsCalendarModalOpen(true)}
                                    title="ë§ˆë¼???¼ì •??ìº˜ë¦°?”ì— ì¶”ê?"
                                >
                                    <Calendar size={18} />
                                    <span>ìº˜ë¦°???±ë¡</span>
                                </button>

                                <button 
                                    type="button"
                                    className="cta-btn-secondary" 
                                    onClick={handleShare}
                                    title="?€???˜ì´ì§€ ë§í¬ ë³µì‚¬"
                                >
                                    {copied ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
                                    <span>{copied ? 'ë³µì‚¬ ?„ë£Œ!' : 'ë§í¬ ë³µì‚¬'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Progress Bar Card */}
            <section className="timeline-card">
                <div className="timeline-title-row">
                    <h3><Clock size={20} /> ?€??ì§„í–‰ ?€?„ë¼??/h3>
                    <span className="timeline-status-tag">
                        {hasRaceFinished ? '?€??ì¢…ë£Œ' : hasRegClosed ? '?€??ì¤€ë¹?ì¤? : hasStarted ? '?‘ìˆ˜ ì§„í–‰ ì¤? : '?‘ìˆ˜ ?ˆì •'}
                    </span>
                </div>

                <div className="timeline-steps-track">
                    {/* Step 1: ?‘ìˆ˜ ?œì‘ */}
                    <div className={`timeline-step-node ${hasStarted ? 'completed' : 'current'}`}>
                        <div className="step-circle">1</div>
                        <span className="step-info-label">?‘ìˆ˜ ?œì‘</span>
                        <span className="step-info-date">{marathon.start_date || 'ë¯¸ì •'}</span>
                    </div>

                    {/* Step 2: ?‘ìˆ˜ ë§ˆê° */}
                    <div className={`timeline-step-node ${hasRegClosed ? 'completed' : (hasStarted ? 'current' : '')}`}>
                        <div className="step-circle">2</div>
                        <span className="step-info-label">?‘ìˆ˜ ë§ˆê°</span>
                        <span className="step-info-date">{marathon.end_date || 'ë¯¸ì •'}</span>
                    </div>

                    {/* Step 3: ?€??ê°œìµœ */}
                    <div className={`timeline-step-node ${hasRaceFinished ? 'completed' : (hasRegClosed ? 'current' : '')}`}>
                        <div className="step-circle">3</div>
                        <span className="step-info-label">?€???¹ì¼</span>
                        <span className="step-info-date">{marathon.race_date || 'ë¯¸ì •'}</span>
                    </div>
                </div>
            </section>

            {/* Main Content 2-Column Grid */}
            <div className="detail-main-grid">
                {/* Left Column: Comprehensive Details */}
                <div className="detail-left-col">
                    {/* 1. ì¢…í•© ?ˆë‚´ */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Info size={22} /> ?€??ì¢…í•© ?ˆë‚´
                        </h2>
                        <div className="details-kv-table">
                            <div className="details-kv-row">
                                <span className="kv-key"><Calendar size={16} /> ê°œìµœ ?¼ì‹œ</span>
                                <span className="kv-value">{formatDateWithDay(marathon.race_date)}</span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><Clock size={16} /> ?‘ìˆ˜ ê¸°ê°„</span>
                                <span className="kv-value">
                                    {marathon.start_date && marathon.end_date 
                                        ? `${marathon.start_date} ~ ${marathon.end_date}${getPeriodDays(marathon.start_date, marathon.end_date)}`
                                        : 'ì£¼ìµœ??ê³µì‹ ê³µì? ì°¸ì¡°'}
                                </span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><MapPin size={16} /> ê°œìµœ ?¥ì†Œ</span>
                                <span className="kv-value">{marathon.location || '?„êµ­'} (?ì„¸ ì½”ìŠ¤??ê³µì‹ ?ˆë‚´ ì°¸ì¡°)</span>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><Award size={16} /> ì¢…ëª© ì½”ìŠ¤</span>
                                <div className="type-pills-list">
                                    {types.map((t, idx) => (
                                        <span key={idx} className="type-pill">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="details-kv-row">
                                <span className="kv-key"><CheckCircle2 size={16} /> ì°¸ê? ë°©ì‹</span>
                                <span className="kv-value">
                                    {marathon.is_first_come ? '? ì°©??ì¡°ê¸° ë§ˆê° ?€??(ë¹ ë¥¸ ?‘ìˆ˜ ê¶Œì¥)' : '?¼ë°˜ ëª¨ì§‘ ?‘ìˆ˜'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. ì½”ìŠ¤ë³??„ì£¼ ê°€?´ë“œ */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Compass size={22} /> ì¢…ëª©ë³?ì½”ìŠ¤ ê°€?´ë“œ
                        </h2>
                        <div className="course-guides-grid">
                            {types.map((t, idx) => {
                                const lower = t.toLowerCase();
                                let dist = 'ë§ˆë¼??ì½”ìŠ¤';
                                let desc = '?ì‹ ???˜ì´?¤ì— ë§ì¶° ?ˆì „?˜ê³  ì¦ê²ê²??„ì£¼ë¥?ëª©í‘œë¡??¬ë ¤ë³´ì„¸??';
                                if (lower.includes('full') || lower.includes('?€')) {
                                    dist = '42.195 km';
                                    desc = 'ì² ì????¥ê±°ë¦?ì§€?ì£¼(LSD) ?ˆë ¨ê³??ë„ˆì§€??ë³´ì¶© ë°??˜ì´??ë°°ë¶„???µì‹¬?…ë‹ˆ??';
                                } else if (lower.includes('half') || lower.includes('?˜í”„')) {
                                    dist = '21.0975 km';
                                    desc = '?¬ë„ˆ?¤ì´ ê°€??? í˜¸?˜ëŠ” ê±°ë¦¬ë¡? ì¤‘ë°˜ ?´í›„ ?¼ì •???¬ë£¨ì¦??˜ì´??? ì?ê°€ ì¤‘ìš”?©ë‹ˆ??';
                                } else if (lower.includes('10k') || lower.includes('10')) {
                                    dist = '10.0 km';
                                    desc = '?…ë¬¸?ë???ê¸°ë¡ ?¨ì¶• ?¬ë„ˆê¹Œì? ê°€???€ì¤‘ì ??ì½”ìŠ¤ë¡??œì›???¤í”¼?œë? ì¦ê¸°ê¸?ì¢‹ìŠµ?ˆë‹¤.';
                                } else if (lower.includes('5k') || lower.includes('5')) {
                                    dist = '5.0 km';
                                    desc = '?¬ë‹??ì²˜ìŒ ?œì‘?˜ëŠ” ë¹„ê¸°?ˆë‚˜ ê°€ì¡? ì¹œêµ¬?€ ê°€ë³ê²Œ ?€?°í•˜ê¸?ê°€??ì¢‹ì? ì½”ìŠ¤?…ë‹ˆ??';
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

                    {/* 3. ?¬ë„ˆ ?€??ì¤€ë¹?ì²´í¬ë¦¬ìŠ¤??*/}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Sparkles size={22} /> ?¬ë„ˆ ?€???„ì£¼ ì²´í¬ë¦¬ìŠ¤??                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?€??1ì£???/span>
                                <p className="checklist-desc-list">
                                    ë°°ë²ˆ??ë°?ê¸°ë…???˜ë ¹ ?•ì¸, ?ˆì´???°ì´??? ì„ ê²€ì¦ëœ ?¬ë‹???ê?, ê³¼ë„??ê°•í›ˆ???€??ì»¨ë””??ì¡°ì ˆ(?Œì´?¼ë§).
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?€???„ë‚ </span>
                                <p className="checklist-desc-list">
                                    ? ë¶„ì¦?ë°?ë°°ë²ˆ???€ ë¶€ì°? ?„ìˆ˜?”ë¬¼ ?„ì£¼???ì‚¬(ì¹´ë³´ë¡œë”©), ì¶©ë¶„???˜ë¶„ ??·¨ ë°?ìµœì†Œ 7?œê°„ ?´ìƒ???™ë©´ ì·¨í•˜ê¸?
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?€???¹ì¼</span>
                                <p className="checklist-desc-list">
                                    ì¶œë°œ 1?œê°„ 30ë¶????€?Œì¥ ?„ì°©, ê°€ë²¼ìš´ ì¡°ê¹…ê³??™ì  ?¤íŠ¸?ˆì¹­, ë¬¼í’ˆ ë³´ê? ??ì¶œë°œ 20ë¶???ì¶œë°œ???€ê¸?
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. ì½”ìŠ¤ ?˜ì´??ë°°ë¶„ & ?„ì£¼ ?„ëµ */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Activity size={22} /> ì½”ìŠ¤ ?˜ì´??ë°°ë¶„ & ?„ì£¼ ?„ëµ
                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">ì´ˆë°˜ (0 ~ 5km)</span>
                                <p className="checklist-desc-list">
                                    <strong>?¤ë²„?˜ì´???ˆë? ê¸ˆì?:</strong> ?€?Œì¥???¨ê±°???´ê¸°?€ ?¸íŒŒ???©ì“¸ë¦¬ì? ?Šê³  ëª©í‘œ ?˜ì´?¤ë³´??10~15ì´???²Œ ì°¨ë¶„??ì¶œë°œ?˜ì—¬ ?¬ë°•?˜ë? ?ˆì •?œí‚µ?ˆë‹¤.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">ì¤‘ë°˜ (5 ~ 15km / ?˜í”„Â·?€)</span>
                                <p className="checklist-desc-list">
                                    <strong>?¬ë£¨ì¦??˜ì´??? ì?:</strong> ?¸í¡ê³?ë³´í­???¼ì •?˜ê²Œ ?•ë ¬?˜ê³  5kmë§ˆë‹¤ ?¤ì¹˜??ê¸‰ìˆ˜?€?ì„œ ëª©ë§ˆë¦„ì„ ?ë¼ê¸??„ì— ?ŒëŸ‰???˜ë¶„??ê·œì¹™?ìœ¼ë¡???·¨?©ë‹ˆ??
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?„ë°˜ (?¼ìŠ¤??êµ¬ê°„)</span>
                                <p className="checklist-desc-list">
                                    <strong>?¤ê±°?°ë¸Œ ?¤í”Œë¦??„ì „:</strong> ?¨ì•„?ˆëŠ” ì²´ë ¥??ë°”íƒ•?¼ë¡œ ?±ì„ ?¹ê¸°ê³??”ì¹˜ê¸°ë? ?˜ì‹?˜ë©° ?¼ì •??ë¦¬ë“¬??? ì????¼ë‹ˆ???¼ì¸ê¹Œì? ?ˆì •?ìœ¼ë¡?ê³¨ì¸?©ë‹ˆ??
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5. ?ˆì´???ì–‘ & ?˜ë¶„ ë³´ì¶© ê°€?´ë“œ */}
                    <div className="content-card-box">
                        <h2 className="card-heading-title">
                            <Zap size={22} /> ?ˆì´???ì–‘ & ?˜ë¶„ ë³´ì¶© ê°€?´ë“œ
                        </h2>
                        <div className="checklist-container">
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?€??3????/span>
                                <p className="checklist-desc-list">
                                    <strong>ê¸€ë¦¬ì½”ê²??€??ì¹´ë³´ë¡œë”©):</strong> ?ê·¹?ì¸ ?Œì‹ê³?ê¸°ë¦„ì§??ì‚¬ë¥??¼í•˜ê³??€ë°? ë°”ë‚˜?? ê³ êµ¬ë§???ë³µí•© ?„ìˆ˜?”ë¬¼ ë¹„ì¤‘???ë‹¨??70%ê¹Œì? ?˜ë¦½?ˆë‹¤.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?€???¹ì¼ ?„ì¹¨</span>
                                <p className="checklist-desc-list">
                                    <strong>ì¶œë°œ 3~4?œê°„ ???ì‚¬:</strong> ?Œí™”ê°€ ?¬ìš´ ?¡ì´??ë² ì´ê¸€, ë°”ë‚˜???„ì£¼ë¡?ê°€ë³ê²Œ ?ì‚¬?˜ê³  ì¶œë°œ 1?œê°„ ?„ê¹Œì§€ ë¯¸ì˜¨??300~500mlë¥??˜ëˆ„??ë§ˆì‹­?ˆë‹¤.
                                </p>
                            </div>
                            <div className="checklist-step-box">
                                <span className="checklist-badge">?ˆì´??ì¤?ë³´ì¶©</span>
                                <p className="checklist-desc-list">
                                    <strong>?ë„ˆì§€???€?´ë°:</strong> ?˜í”„/?€ì½”ìŠ¤ ì£¼ì??10km, 20km, 30km ì§€??ê¸‰ìˆ˜?€ ì§ì „???ë„ˆì§€?¤ì„ ??·¨?˜ê³  ë¬¼ê³¼ ?¨ê»˜ ?˜ê²¨ ì²´ë‚´ ?¡ìˆ˜?¨ì„ ?’ì…?ˆë‹¤.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 6. ?ˆë‚´ ë°?? ì˜?¬í•­ */}
                    <div className="detail-trust-box">
                        <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div className="trust-box-text">
                            <strong>ì°¸ê? ? ì²­ ???•ì¸ ?ˆë‚´</strong><br />
                            ?€???¼ì •, ì½”ìŠ¤ êµ¬ì„±, ê¸°ë…??ë°??‘ìˆ˜ ë§ˆê° ?œê°„?€ ì£¼ìµœÂ·ì£¼ê??¬ì˜ ?¬ì •???°ë¼ ?ˆê³  ?†ì´ ë³€ê²½ë  ???ˆìŠµ?ˆë‹¤. 
                            ì°¸ê? ? ì²­ ë°?ê²°ì œ ??ë°˜ë“œ???„ë˜ ê³µì‹ ?ˆí˜?´ì???ìµœì‹  ê³µì??¬í•­???•ì¸??ì£¼ì‹œê¸?ë°”ë?ˆë‹¤.
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Action & Related Widget */}
                <aside className="detail-sidebar">
                    {/* Official Hub Card */}
                    <div className="sidebar-action-card">
                        <h3 className="sidebar-title">
                            <LinkIcon size={18} /> ê³µì‹ ì°¸ê? ? ì²­
                        </h3>
                        <p className="sidebar-desc">
                            ê³µì‹ ì£¼ìµœ???¹ì‚¬?´íŠ¸ë¡??°ê²°?©ë‹ˆ?? ì°¸ê? ?”ê°• ë°?ì½”ìŠ¤?„ë? ?•ì¸ ???‘ìˆ˜?˜ì„¸??
                        </p>
                        {marathon.link ? (
                            <a 
                                href={marathon.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="sidebar-cta-btn"
                            >
                                ê³µì‹ ?¬ì´??ë°”ë¡œê°€ê¸?<ExternalLink size={18} />
                            </a>
                        ) : (
                            <button className="sidebar-cta-btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                ê³µì‹ ?‘ìˆ˜ ë§í¬ ì¤€ë¹?ì¤?                            </button>
                        )}
                    </div>

                    {/* Related Marathons Widget */}
                    {relatedMarathons.length > 0 && (
                        <div className="related-widget">
                            <h3 className="sidebar-title">
                                <Award size={18} /> ?¨ê»˜ ?˜ëŸ¬ë³´ëŠ” ?€??                            </h3>
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
                                                <Calendar size={12} /> {rm.raceDate} Â· {rm.location}
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
                            title="?«ê¸°"
                        >
                            <X size={20} />
                        </button>
                        <img 
                            src={marathon.poster_url} 
                            alt={`${marathon.title} ?¬ìŠ¤???ë³¸`}
                            className="poster-modal-img" 
                        />
                        <p className="poster-modal-source">
                            ?´ë?ì§€ ì¶œì²˜: {marathon.title} ì£¼ìµœ ì¸?Â· ?ë³´ ëª©ì  ê²Œì‹œ Â· <Link to="/copyright" onClick={() => setIsPosterModalOpen(false)}>?€?‘ê¶Œ ?•ì±…</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Calendar Integration Modal (ëª¨ë°”??& ?°ìŠ¤?¬í†± ?„ë²½ ?€?? */}
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
                                <h3>ë§ˆë¼???¼ì • ìº˜ë¦°???±ë¡</h3>
                            </div>
                            <button 
                                className="cal-modal-close-btn"
                                onClick={() => setIsCalendarModalOpen(false)}
                                title="?«ê¸°"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="cal-modal-desc">
                            ?€???¼ì •??ìº˜ë¦°?”ì— ?±ë¡?˜ì—¬ ?‘ìˆ˜ ë§ˆê°ê³??€???¹ì¼???“ì¹˜ì§€ ë§ˆì„¸??
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
                                    <strong>êµ¬ê? ìº˜ë¦°?”ì— ?±ë¡</strong>
                                    <small>êµ¬ê? ??ìº˜ë¦°????ì°½ì—??ë°”ë¡œ ì¶”ê?</small>
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
                                    <strong>? í”Œ / ?¤ë§ˆ?¸í° ìº˜ë¦°??(.ics)</strong>
                                    <small>?„ì´??ê°¤ëŸ­??ê¸°ë³¸ ìº˜ë¦°???ë™ ?±ë¡ (D-1 ?Œë¦¼ ?¬í•¨)</small>
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
