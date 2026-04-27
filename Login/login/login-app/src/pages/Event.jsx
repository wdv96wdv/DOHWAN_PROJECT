import React, { useState, useEffect } from "react";
import "../assets/css/event.css";
import "../assets/css/auth.css";
import { Trophy, Activity, TrendingUp, Info, UserCircle } from 'lucide-react';
import Loading from '../components/Common/Loading';
import noImage from '../assets/img/no-image.png';
import useAuthStore from '../store/useAuthStore';
import api from '../apis/api';

const EventPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const userInfo = useAuthStore(state => state.userInfo);

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
            <header className="event-header">
                <div className="pulse-circle"></div>
                <h1><Trophy size={48} className="text-primary" style={{ verticalAlign: 'middle', marginRight: '16px' }} /> {currentMonth.toUpperCase()} CHALLENGE</h1>
                <p>이번 달, 가장 꾸준히 달린 러너는 누구일까요?</p>
                
                <div className="challenge-overview">
                    <div className="challenge-goal glass-card">
                        <div className="goal-icon-bg"><Trophy size={32} /></div>
                        <div className="goal-text">
                            <div className="goal-header-row">
                                <h3>이달의 공동 목표: 50km 달성하기</h3>
                                {userInfo && leaderboard.find(u => u.username === userInfo.username)?.totalDistance >= 50 && 
                                    <span className="completion-badge">GOAL REACHED!</span>
                                }
                            </div>
                            <p>Dorunning 크루들과 함께 한계에 도전하고 명예의 전당 최상단을 차지하세요!</p>
                            {userInfo && (() => {
                                const myData = leaderboard.find(u => u.username === userInfo.username);
                                if (!myData) return null;
                                return (
                                    <div className="my-contribution-mini">
                                        <Activity size={14} /> 
                                        <span>나의 기여도: <strong>{myData.totalDistance.toFixed(1)}km</strong> ({myData.runCount}회 활동)</span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="leaderboard-container glass-card">
                <h2 className="leaderboard-title"><TrendingUp size={28} style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--primary)' }} /> 월간 명예의 전당</h2>

                {leaderboard.length === 0 ? (
                    <div className="no-data"><Info size={32} /> 아직 이번 달 기록이 없습니다.<br />첫 번째 주인공이 되어보세요!</div>
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
