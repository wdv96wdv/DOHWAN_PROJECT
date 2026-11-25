import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  Trophy,
  MessageSquare,
  CalendarPlus,
  ChevronRight,
  Image as ImageIcon,
  Users,
  Loader2,
  Footprints,
} from 'lucide-react';
import Swal from 'sweetalert2';
import supabase from '../../utils/supabaseClient';
import { getUnreadContactCount } from '../../utils/contactNotification';
import useAuthStore from '../../store/useAuthStore';
import '../../assets/css/admin-dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const userInfo = useAuthStore(state => state.userInfo);
  const hasAlerted = useRef(false);

  const [stats, setStats] = useState({
    totalMarathons: 0,
    withPoster: 0,
    withoutPoster: 0,
    pendingCount: 0,
    totalContacts: 0,
    unreadContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  // 접근 제어
  useEffect(() => {
    if (hasAlerted.current) return;
    if (!isLogin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: '관리자 페이지는 로그인 후 이용 가능합니다.',
        confirmButtonColor: 'var(--primary)',
      }).then(() => navigate('/', { replace: true }));
      return;
    }
    if (!roles?.isAdmin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'error',
        title: '접근 제한',
        text: '관리자 권한이 필요합니다.',
        confirmButtonColor: 'var(--primary)',
      }).then(() => navigate('/', { replace: true }));
    }
  }, [isLogin, roles, navigate]);

  // 통계 로드
  useEffect(() => {
    if (!isLogin || !roles?.isAdmin) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const [marathonRes, contactRes] = await Promise.allSettled([
          supabase.from('marathons').select('id, poster_url, status'),
          token
            ? axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/contact`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              })
            : Promise.resolve({ data: [] }),
        ]);

        const marathons =
          marathonRes.status === 'fulfilled' ? marathonRes.value.data || [] : [];
        const contacts =
          contactRes.status === 'fulfilled' && Array.isArray(contactRes.value.data)
            ? contactRes.value.data
            : [];

        const total = marathons.length;
        const withPoster = marathons.filter(m => m.poster_url).length;
        const pending = marathons.filter(m => m.status === 'pending').length;
        const unreadContacts = getUnreadContactCount(contacts);

        setStats({
          totalMarathons: total,
          withPoster,
          withoutPoster: total - withPoster,
          pendingCount: pending,
          totalContacts: contacts.length,
          unreadContacts,
        });
      } catch (err) {
        console.error('통계 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const handleContactsSeen = () => {
      setStats(prev => ({ ...prev, unreadContacts: 0 }));
    };
    window.addEventListener('contacts-seen', handleContactsSeen);
    return () => window.removeEventListener('contacts-seen', handleContactsSeen);
  }, [isLogin, roles]);

  if (!isLogin || !roles?.isAdmin) return null;

  return (
    <div className="admin-dashboard">
      {/* 헤더 */}
      <header className="admin-dash-header">
        <h1><ShieldCheck size={26} /> 관리자 대시보드</h1>
        <p>
          {userInfo?.name || userInfo?.username || '관리자'}님, 안녕하세요.
          두러닝 서비스를 관리합니다.
        </p>
      </header>

      {/* 통계 카드 */}
      {loading ? (
        <div className="dash-loading">
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="dash-stats-row">
          <div className="dash-stat-card">
            <div className="dash-stat-icon blue">
              <Trophy size={22} />
            </div>
            <div className="dash-stat-info">
              <div className="stat-val">{stats.totalMarathons}</div>
              <div className="stat-lbl">전체 대회</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon green">
              <ImageIcon size={22} />
            </div>
            <div className="dash-stat-info">
              <div className="stat-val">{stats.withPoster}</div>
              <div className="stat-lbl">포스터 등록</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon amber">
              <ImageIcon size={22} />
            </div>
            <div className="dash-stat-info">
              <div className="stat-val">{stats.withoutPoster}</div>
              <div className="stat-lbl">포스터 미등록</div>
            </div>
          </div>

          {stats.pendingCount > 0 && (
            <div className="dash-stat-card" onClick={() => navigate('/admin/marathons?status=pending')} style={{ cursor: 'pointer' }}>
              <div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                <CalendarPlus size={22} />
              </div>
              <div className="dash-stat-info">
                <div className="stat-val" style={{ color: '#f59e0b' }}>{stats.pendingCount}</div>
                <div className="stat-lbl">⏳ 승인 대기</div>
              </div>
            </div>
          )}

          <div className="dash-stat-card" onClick={() => navigate('/admin/contacts')} style={{ cursor: 'pointer' }}>
            <div
              className="dash-stat-icon"
              style={{
                background: stats.unreadContacts > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.1)',
                color: stats.unreadContacts > 0 ? '#ef4444' : '#22c55e',
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div className="dash-stat-info">
              <div className="stat-val" style={stats.unreadContacts > 0 ? { color: '#ef4444' } : undefined}>
                {stats.unreadContacts > 0 ? stats.unreadContacts : stats.totalContacts}
              </div>
              <div className="stat-lbl">
                {stats.unreadContacts > 0 ? '새 문의 (미확인)' : '전체 문의'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 카드 */}
      <div className="dash-menu-title">관리 메뉴</div>
      <div className="dash-menu-grid">
        <div
          className="dash-menu-card"
          onClick={() => navigate(stats.pendingCount > 0 ? '/admin/marathons?status=pending' : '/admin/marathons')}
        >
          <div className="dash-menu-card-icon marathon">
            <Trophy size={22} />
            {stats.pendingCount > 0 && (
              <span className="dash-unread-badge" aria-label={`승인 대기 마라톤 ${stats.pendingCount}건`}>
                {stats.pendingCount > 99 ? '99+' : stats.pendingCount}
              </span>
            )}
          </div>
          <div className="dash-menu-card-info">
            <div className="dash-menu-title-row">
              <h3>마라톤 대회 관리</h3>
              {stats.pendingCount > 0 && (
                <span className="dash-unread-pill">승인 대기 {stats.pendingCount}</span>
              )}
            </div>
            <p>등록된 대회 목록 조회, 수정, 삭제 및 포스터 이미지 업로드</p>
          </div>
          <ChevronRight size={18} className="dash-menu-card-arrow" />
        </div>

        <div className="dash-menu-card" onClick={() => navigate('/admin/contacts')}>
          <div className="dash-menu-card-icon contact">
            <MessageSquare size={22} />
            {stats.unreadContacts > 0 && (
              <span className="dash-unread-badge" aria-label={`새 문의 ${stats.unreadContacts}건`}>
                {stats.unreadContacts > 99 ? '99+' : stats.unreadContacts}
              </span>
            )}
          </div>
          <div className="dash-menu-card-info">
            <div className="dash-menu-title-row">
              <h3>문의 관리</h3>
              {stats.unreadContacts > 0 && (
                <span className="dash-unread-pill">NEW {stats.unreadContacts}</span>
              )}
            </div>
            <p>사용자 문의 내용 확인 및 처리 (전체 {stats.totalContacts}건)</p>
          </div>
          <ChevronRight size={18} className="dash-menu-card-arrow" />
        </div>

        <div className="dash-menu-card" onClick={() => navigate('/admin/courses')}>
          <div className="dash-menu-card-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
            <Footprints size={22} />
          </div>
          <div className="dash-menu-card-info">
            <h3>러닝 코스 관리</h3>
            <p>전국 러닝 성지 및 대회 코스 신규 등록, 대표 이미지 수정, 삭제</p>
          </div>
          <ChevronRight size={18} className="dash-menu-card-arrow" />
        </div>

        <div className="dash-menu-card" onClick={() => navigate('/marathon/register')}>
          <div className="dash-menu-card-icon register">
            <CalendarPlus size={22} />
          </div>
          <div className="dash-menu-card-info">
            <h3>새 대회 등록</h3>
            <p>새로운 마라톤 대회 일정을 직접 등록</p>
          </div>
          <ChevronRight size={18} className="dash-menu-card-arrow" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

