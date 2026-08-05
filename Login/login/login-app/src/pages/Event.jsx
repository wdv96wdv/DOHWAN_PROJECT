import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/event.css";
import "../assets/css/auth.css";
import { Trophy, Activity, TrendingUp, Info, UserCircle } from 'lucide-react';
import Loading from '../components/Common/Loading';
import noImage from '../assets/img/no-image.png';
import useAuthStore from '../store/useAuthStore';
import api from '../apis/api';
import { Helmet } from 'react-helmet-async';

const EventPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const userInfo = useAuthStore(state => state.userInfo);
    const isLogin = useAuthStore(state => state.isLogin);

    useEffect(() => {
        api.get(`/records/leaderboard`)
            .then(response => {
                const data = response.data;
                if (data.status === 200 && data.data) {
                    setLeaderboard(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Leaderboard load failed", err);
                setLoading(false);
            });
    }, []);

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    if (loading) return <Loading text="랭킹 데이터를 불러오는 중입니다..." />;

    // Top 3 and others
    const top3 = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    // Fallback Avatar Generator
    const getAvatar = (user) => {
        // 1. 현재 로그인한 본인인 경우, userInfo의 최신 프로필 사진을 우선 사용
        if (userInfo && userInfo.username === user.username && userInfo.avatarUrl) {
            return userInfo.avatarUrl;
        }

        // 2. 백엔드에서 전달받은 아바타가 유효한 경우 사용
        if (user.avatarUrl && user.avatarUrl.trim() !== '') {
            return user.avatarUrl;
        }

        // 3. 사진이 없으면 null 반환하여 기본 아이콘으로 렌더링되게 함
        return null;
    };

    return (
        <div className="event-page">
            <Helmet>
                <title>Dorunning | 챌린지</title>
                <meta name="description" content="이달의 러닝 챌린지에 도전하고 명예의 전당에 이름을 올리세요. 다른 러너들과 함께 목표를 달성하며 즐겁게 달려보세요!" />
                <meta property="og:title" content="Dorunning | 챌린지" />
                <meta property="og:description" content="이달의 러닝 챌린지에 도전하고 명예의 전당에 이름을 올리세요." />
                <link rel="canonical" href="https://dorunning.vercel.app/event" />
            </Helmet>
            <header className="event-header">
                <h1><Trophy size={40} style={{ verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)' }} /> {currentMonth.toUpperCase()} CHALLENGE</h1>
            </header>

            <div className="leaderboard-container glass-card">
                <h2 className="leaderboard-title"><TrendingUp size={28} style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--primary)' }} /> 월간 명예의 전당</h2>

                {leaderboard.length === 0 ? (
                    <div className="no-data-container">
                        <div className="no-data-illustration">
                            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="glowing-svg">
                                <defs>
                                    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" />
                                    </linearGradient>
                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="50%" stopColor="var(--accent)" />
                                        <stop offset="100%" stopColor="var(--primary)" />
                                    </linearGradient>
                                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle cx="90" cy="90" r="70" stroke="url(#glowGrad)" strokeWidth="1" strokeDasharray="5 5" className="orbit-circle orbit-slow" />
                                <circle cx="90" cy="90" r="55" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="15 10" className="orbit-circle orbit-fast" />
                                
                                <circle cx="90" cy="90" r="35" fill="url(#glowGrad)" opacity="0.15" filter="url(#glowFilter)" className="pulse-bg" />

                                <circle cx="35" cy="50" r="3" fill="var(--accent)" opacity="0.6" className="float-dot-1" />
                                <circle cx="145" cy="130" r="4" fill="var(--primary)" opacity="0.7" className="float-dot-2" />
                                <circle cx="140" cy="45" r="2" fill="var(--accent)" opacity="0.5" className="float-dot-3" />
                                <circle cx="45" cy="125" r="3" fill="var(--primary)" opacity="0.4" className="float-dot-4" />

                                <path d="M 50,110 C 70,80 110,80 130,110" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                                <path d="M 40,120 C 65,95 115,95 140,120" stroke="url(#lineGrad)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.5" />

                                <g transform="translate(62, 52)" filter="url(#glowFilter)" className="trophy-graphic">
                                    <path d="M 12 6 C 12 1.5 44 1.5 44 6 C 44 26 34 32 28 36 L 28 44 L 38 44 C 40 44 40 48 38 48 L 18 48 C 16 48 16 44 18 44 L 28 44 L 28 36 C 22 32 12 26 12 6 Z" fill="url(#glowGrad)" stroke="var(--primary)" strokeWidth="1.5" />
                                    <path d="M 12 12 L 4 12 C 2 12 2 20 6 22 L 12 22" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                    <path d="M 44 12 L 52 12 C 54 12 54 20 50 22 L 44 22" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                    <path d="M 28 12 L 28 20 M 24 16 L 32 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="sparkle-anim" />
                                </g>
                            </svg>
                        </div>
                        <h3 className="no-data-title">첫 번째 주인공이 되어보세요!</h3>
                        <p className="no-data-text">아직 이번 달 기록이 없습니다.<br />첫 발걸음을 내딛고 이달의 랭킹 1위를 차지해보세요!</p>
                        <Link to={isLogin ? "/record" : "/login"} className="no-data-btn">
                            <Activity size={18} />
                            <span>지금 달리러 가기</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Podium Section for Top 3 */}
                        <div className="podium-container">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="podium-step podium-silver">
                                    <div className="podium-avatar-wrapper">
                                        <div className="medal-badge">🥈</div>
                                        {getAvatar(top3[1]) ? (
                                            <img src={getAvatar(top3[1])} alt={top3[1].username} className="podium-avatar" />
                                        ) : (
                                            <div className="podium-avatar fallback-icon"><UserCircle size={50} color="#888" strokeWidth={1} /></div>
                                        )}
                                    </div>
                                    <div className="podium-name">{top3[1].username}</div>
                                    <div className="podium-score">{top3[1].totalDistance.toFixed(1)} <small>km</small></div>
                                    <div className="podium-bar silver-bg">
                                        <span>2</span>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <div className="podium-step podium-gold">
                                    <div className="podium-avatar-wrapper">
                                        <div className="medal-badge gold">🥇</div>
                                        {getAvatar(top3[0]) ? (
                                            <img src={getAvatar(top3[0])} alt={top3[0].username} className="podium-avatar gold-border" />
                                        ) : (
                                            <div className="podium-avatar gold-border fallback-icon"><UserCircle size={64} color="#ffd700" strokeWidth={1} /></div>
                                        )}
                                    </div>
                                    <div className="podium-name highlight">{top3[0].username}</div>
                                    <div className="podium-score highlight">{top3[0].totalDistance.toFixed(1)} <small>km</small></div>
                                    <div className="podium-bar gold-bg">
                                        <span>1</span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <div className="podium-step podium-bronze">
                                    <div className="podium-avatar-wrapper">
                                        <div className="medal-badge">🥉</div>
                                        {getAvatar(top3[2]) ? (
                                            <img src={getAvatar(top3[2])} alt={top3[2].username} className="podium-avatar" />
                                        ) : (
                                            <div className="podium-avatar fallback-icon"><UserCircle size={50} color="#888" strokeWidth={1} /></div>
                                        )}
                                    </div>
                                    <div className="podium-name">{top3[2].username}</div>
                                    <div className="podium-score">{top3[2].totalDistance.toFixed(1)} <small>km</small></div>
                                    <div className="podium-bar bronze-bg">
                                        <span>3</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List for 4th and below */}
                        <div className="leaderboard-list mt-8">
                            {others.map((user, idx) => {
                                const index = idx + 3; // Start from 4th
                                const isCurrentUser = userInfo?.username === user.username;
                                const avatarSrc = getAvatar(user);

                                return (
                                    <div key={user.username} className={`leaderboard-item ${isCurrentUser ? 'current-user-rank' : ''}`}>
                                        <div className="rank-badge rank-other">{index + 1}</div>
                                        {avatarSrc ? (
                                            <img
                                                src={avatarSrc}
                                                alt={user.username}
                                                className="player-avatar"
                                                onError={(e) => { e.target.src = noImage; }}
                                            />
                                        ) : (
                                            <div className="player-avatar fallback-icon-small"><UserCircle size={32} color="#888" strokeWidth={1.5} /></div>
                                        )}
                                        <div className="player-info">
                                            <div className="player-name">
                                                {user.username} {isCurrentUser && <span className="me-badge">ME</span>}
                                            </div>
                                            <div className="player-stats">
                                                <Activity size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {user.runCount}번 달림
                                            </div>
                                        </div>
                                        <div className="player-score">
                                            <span className="distance-value">{user.totalDistance.toFixed(1)}</span>
                                            <span className="distance-unit">km</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventPage;
