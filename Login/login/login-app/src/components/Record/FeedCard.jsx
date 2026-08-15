import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import useAuthStore from "../../store/useAuthStore";
import api from "../../apis/api"; 
import { formatPace } from "../../utils/formatters";
import { toast } from 'react-toastify';
import './FeedCard.css';

export default function FeedCard({ record, isLoading }) {
    const { isLogin } = useAuthStore();
    
    // Skeleton UI for loading state
    if (isLoading) {
        return (
            <div className="feed-card-container glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%', marginRight: '12px', background: '#e0e0e0', animation: 'pulse 1.5s infinite' }}></div>
                    <div>
                        <div className="skeleton" style={{ width: '120px', height: '16px', background: '#e0e0e0', marginBottom: '6px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                        <div className="skeleton" style={{ width: '80px', height: '12px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                    </div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: '200px', background: '#e0e0e0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
        );
    }

    if (!record) return null;

    const [likes, setLikes] = useState(record.reactionCount || 0);
    const [isLiked, setIsLiked] = useState(record.liked || false);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (!isLogin) {
            toast.warn("로그인이 필요합니다.");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            // Optimistic UI update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

            // Use the axios instance which automatically attaches the JWT token
            await api.post(`/records/${record.id || record.no}/like`);
            
        } catch (error) {
            console.error("Like error:", error);
            // Revert on error
            setIsLiked(!isLiked);
            setLikes(prev => isLiked ? prev + 1 : prev - 1);
            toast.error("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="feed-card-container glass-card">
            {/* Header: User Info */}
            <div className="feed-header">
                <div className="feed-avatar-wrapper">
                    {record.avatarUrl
                        ? <img src={record.avatarUrl} alt="avatar" className="feed-avatar-img" />
                        : <div className="feed-avatar-placeholder">
                            {record.username ? record.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                    }
                </div>
                <div>
                    <div className="feed-username">{record.username || 'Unknown Runner'}</div>
                    <div className="feed-meta">
                        {record.runningName && <span className="feed-running-name">🏃 {record.runningName}</span>}
                        {record.date}
                    </div>
                </div>
            </div>

            {/* Image (if exists) */}
            {record.imageUrl && (
                <div className="feed-image">
                    <img src={record.imageUrl} alt="Run log" loading="lazy" />
                </div>
            )}

            {/* Body: Run Stats */}
            <div className="feed-body">
                <div className="feed-stats-row">
                    <div>
                        <div className="feed-distance-value">
                            {record.distanceKm?.toFixed(2)} <span className="feed-distance-unit">km</span>
                        </div>
                    </div>
                    <div className="feed-time-pace">
                        <div className="feed-duration">
                            {Math.floor(record.durationSec / 60)}:{String(record.durationSec % 60).padStart(2, '0')}
                        </div>
                        <div className="feed-pace">{formatPace(record.paceMinPerKm)} /km</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="feed-actions">
                    <button 
                        onClick={handleLike} 
                        className={`btn-like ${isLiked ? 'liked' : ''}`}
                        aria-label="Like this run"
                    >
                        <Flame 
                            className="like-icon-anim"
                            fill={isLiked ? '#ff4757' : 'none'} 
                            color={isLiked ? '#ff4757' : 'currentColor'} 
                            size={24} 
                        />
                        <span style={{ fontWeight: 'bold' }}>{likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
