import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';
import Loading from '../components/Common/Loading';

const MarathonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [marathon, setMarathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                const response = await axios.get(`${API_BASE_URL}/api/marathons/${id}`);
                setMarathon(response.data);
                
                // 보조 타이틀 설정
                if (response.data && response.data.title) {
                    document.title = `Dorunning | 마라톤일정 | ${response.data.title}`;
                }
            } catch (err) {
                console.error('상세 정보 로드 실패:', err);
                setError('정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // D-Day 계산
    const calculateDDay = (targetDate) => {
        if (!targetDate) return '';
        const today = new Date();
        const target = new Date(targetDate);
        const diff = target - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'D-Day' : days > 0 ? `D-${days}` : `종료`;
    };

    if (loading) {
        return (
            <div className="container marathon-detail-page">
                <Helmet>
                    <title>Dorunning | 마라톤일정 | 상세정보</title>
                </Helmet>
                <Loading text="대회 상세 정보를 불러오는 중..." />
                <style dangerouslySetInnerHTML={{ __html: `
                    .marathon-detail-page { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
                `}} />
            </div>
        );
    }

    if (error || !marathon) {
        return (
            <div className="container marathon-detail-page">
                <Helmet>
                    <title>Dorunning | 마라톤일정 | 에러</title>
                </Helmet>
                <div className="error-container">{error || '데이터가 없습니다.'}</div>
                <style dangerouslySetInnerHTML={{ __html: `
                    .marathon-detail-page { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
                `}} />
            </div>
        );
    }

    const dDay = calculateDDay(marathon.race_date);

    return (
        <div className="container marathon-detail-page">
            <Helmet>
                <title>Dorunning | 마라톤일정 | {marathon.title}</title>
                <meta name="description" content={`${marathon.location}에서 열리는 ${marathon.title}의 일정, 접수 방법, 종목 등 상세 정보를 확인하세요.`} />
                
                {/* Google Event Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Event",
                        "name": marathon.title,
                        "description": `${marathon.title} 마라톤 상세 정보, 일정, 장소 및 접수 안내`,
                        "startDate": marathon.race_date,
                        "endDate": marathon.race_date,
                        "eventStatus": "https://schema.org/EventScheduled",
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
                        "image": marathon.poster_url || "https://dorunning.vercel.app/og-image.png",
                        "offers": {
                            "@type": "Offer",
                            "url": window.location.href,
                            "availability": "https://schema.org/InStock",
                            "validFrom": marathon.start_date
                        },
                        "organizer": {
                            "@type": "Organization",
                            "name": "Dorunning",
                            "url": "https://dorunning.vercel.app"
                        }
                    })}
                </script>

                {/* Open Graph / KakaoTalk */}
                <meta property="og:title" content={`Dorunning | 마라톤일정 | ${marathon.title}`} />
                <meta property="og:description" content={`${marathon.race_date} ${marathon.location} 개최. 종목: ${marathon.type?.join(', ')}`} />
                {marathon.poster_url && <meta property="og:image" content={marathon.poster_url} />}
                <meta property="og:url" content={window.location.href} />

                {/* Twitter */}
                <meta name="twitter:title" content={`Dorunning | 마라톤일정 | ${marathon.title}`} />
                <meta name="twitter:description" content={`${marathon.race_date} ${marathon.location} 개최.`} />
                {marathon.poster_url && <meta name="twitter:image" content={marathon.poster_url} />}
            </Helmet>

            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} /> 뒤로가기
            </button>

            <div className="marathon-detail-header glass-card">
                <div className="header-content">
                    <span className={`status-badge ${dDay.includes('-') ? 'status-active' : 'status-closed'}`}>
                        {dDay}
                    </span>
                    <h1>{marathon.title}</h1>
                    <div className="header-meta">
                        <span><MapPin size={18} /> {marathon.location}</span>
                        <span><Calendar size={18} /> {marathon.race_date}</span>
                    </div>
                </div>
            </div>

            <div className="marathon-detail-grid">
                {/* 1. 핵심 정보 카드 */}
                <div className="detail-info-card glass-card">
                    <h3><Info size={20} /> 대회 상세 정보</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <label><Clock size={16} /> 접수 기간</label>
                            <p>{marathon.start_date} ~ {marathon.end_date}</p>
                        </div>
                        <div className="info-item">
                            <label><Award size={16} /> 참가 종목</label>
                            <div className="type-tags">
                                {marathon.type && marathon.type.map((t, index) => (
                                    <span key={index} className="type-tag">{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="info-item">
                            <label><CheckCircle2 size={16} /> 신청 방식</label>
                            <p>{marathon.is_first_come ? '선착순 접수' : '일반 접수'}</p>
                        </div>
                    </div>
                </div>

                {/* 2. 공식 채널 카드 */}
                <div className="detail-action-card glass-card">
                    <h3><LinkIcon size={20} /> 공식 채널</h3>
                    <p>대회 요강 확인 및 참가 신청은 공식 홈페이지를 이용해 주세요.</p>
                    <a 
                        href={marathon.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link-btn"
                    >
                        공식 홈페이지 바로가기 <LinkIcon size={16} />
                    </a>
                </div>
            </div>

            {marathon.poster_url && (
                <div className="poster-section glass-card" style={{ marginTop: '30px', padding: '40px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}><Award size={20} /> 대회 포스터</h3>
                    <img src={marathon.poster_url} alt={`${marathon.title} 포스터`} style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .marathon-detail-page { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
                .back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-bottom: 24px; font-weight: 500; transition: color 0.2s; }
                .back-btn:hover { color: var(--primary); }
                
                .marathon-detail-header { padding: 40px; margin-bottom: 30px; border-radius: 20px; }
                .header-content h1 { font-size: 2.5rem; margin: 15px 0; color: var(--text-primary); line-height: 1.2; }
                .header-meta { display: flex; gap: 20px; color: var(--text-secondary); }
                .header-meta span { display: flex; align-items: center; gap: 6px; }

                .status-badge { padding: 6px 14px; border-radius: 30px; font-size: 0.9rem; font-weight: 700; width: fit-content; }
                .status-active { background: rgba(0, 123, 255, 0.15); color: #007bff; border: 1px solid rgba(0, 123, 255, 0.3); }
                .status-closed { background: rgba(108, 117, 125, 0.1); color: #6c757d; }

                .marathon-detail-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
                
                .detail-info-card, .detail-action-card { padding: 30px; border-radius: 20px; }
                .detail-info-card h3, .detail-action-card h3 { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-size: 1.25rem; }

                .info-list { display: flex; flex-direction: column; gap: 20px; }
                .info-item label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
                .info-item p { font-size: 1.1rem; font-weight: 500; }

                .type-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
                .type-tag { background: var(--bg-secondary); padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; border: 1px solid var(--border-color); }

                .external-link-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 16px; background: var(--primary); color: white; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 20px; transition: transform 0.2s, background 0.2s; }
                .external-link-btn:hover { background: var(--primary-dark); transform: translateY(-2px); }

                @media (max-width: 768px) {
                    .marathon-detail-grid { grid-template-columns: 1fr; }
                    .header-content h1 { font-size: 1.8rem; }
                    .marathon-detail-header { padding: 24px; }
                }
            `}} />
        </div>
    );
};

export default MarathonDetail;
