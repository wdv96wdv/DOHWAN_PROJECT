import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin, Footprints, Flame } from 'lucide-react';
import useAuthStore from "../../store/useAuthStore";
import api from "../../apis/api"; // Assuming there is an axios instance or similar. If not, use fetch.

export default function FeedCard({ record }) {
    const { isLogin, userInfo } = useAuthStore();
    const [likes, setLikes] = useState(record.reactionCount || 0);
    const [isLiked, setIsLiked] = useState(record.liked || false);
    const [isLiking, setIsLiking] = useState(false);

    const formatPace = (pace) => {
        if (!pace) return "0'00\"";
        const mins = Math.floor(pace);
        const secs = Math.round((pace - mins) * 60);
        return `${mins}'${secs.toString().padStart(2, '0')}"`;
    };

    const handleLike = async () => {
        if (!isLogin) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        try {
            // Optimistic UI update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

            const token = localStorage.getItem('jwt');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/records/${record.id || record.no}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error("Failed to toggle like");
            }
        } catch (error) {
            console.error("Like error:", error);
            // Revert on error
            setIsLiked(!isLiked);
            setLikes(prev => isLiked ? prev + 1 : prev - 1);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="feed-card glass-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
            {/* Header: User Info */}
            <div className="feed-header" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                <div style={{ marginRight: '12px', flexShrink: 0 }}>
                    {record.avatarUrl
                        ? <img src={record.avatarUrl} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1.2rem'
                          }}>
                            {record.username ? record.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                    }
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{record.username || 'Unknown Runner'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {record.runningName && <span style={{ marginRight: '8px' }}>🏃 {record.runningName}</span>}
                        {record.date}
                    </div>
                </div>
            </div>

            {/* Image (if exists) */}
            {record.imageUrl && (
                <div className="feed-image">
                    <img src={record.imageUrl} alt="Run log" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                </div>
            )}

            {/* Body: Run Stats */}
            <div className="feed-body" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>
                            {record.distanceKm?.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>km</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {Math.floor(record.durationSec / 60)}:{String(record.durationSec % 60).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatPace(record.paceMinPerKm)} /km</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="feed-actions" style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                        onClick={handleLike} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', 
                            color: isLiked ? '#ff4757' : 'var(--text-primary)',
                            fontSize: '1rem',
                            transition: 'color 0.2s'
                        }}
                    >
                        <Flame fill={isLiked ? '#ff4757' : 'none'} color={isLiked ? '#ff4757' : 'currentColor'} size={24} />
                        <span style={{ fontWeight: 'bold' }}>{likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
