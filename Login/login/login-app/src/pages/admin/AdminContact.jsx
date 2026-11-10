import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  MessageSquare,
  Trash2,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import useAuthStore from "../../store/useAuthStore";
import '../../assets/css/admin-marathon.css';

const AdminContact = () => {
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const navigate = useNavigate();
  const hasAlerted = useRef(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (hasAlerted.current) return;
    if (!isLogin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning', title: '로그인이 필요합니다',
        text: '관리자 페이지는 로그인 후 이용 가능합니다.',
        confirmButtonColor: 'var(--primary)',
      }).then(() => navigate('/', { replace: true }));
      return;
    }
    if (!roles?.isAdmin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'error', title: '접근 제한',
        text: '관리자 권한이 필요합니다.',
        confirmButtonColor: 'var(--primary)',
      }).then(() => navigate('/', { replace: true }));
    }
  }, [isLogin, roles, navigate]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
      setError("문의 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '이 문의를 삭제하시겠습니까?',
      text: '삭제된 문의는 복구할 수 없습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(contacts.filter((c) => c.id !== id));
        Swal.fire({ icon: 'success', title: '삭제 완료', timer: 1500, showConfirmButton: false });
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: '삭제 실패', text: '잠시 후 다시 시도해 주세요.' });
      }
    }
  };

  const handleMailTo = (contact) => {
    const subject = encodeURIComponent(`[두러닝] 문의 답변드립니다`);
    const body = encodeURIComponent(
      `안녕하세요, ${contact.name}님.\n\n두러닝 운영팀입니다.\n문의해 주신 내용에 대해 답변드립니다.\n\n---\n원본 문의:\n${contact.message}\n---\n\n답변:\n\n\n감사합니다.\n두러닝 운영팀 드림`
    );
    // window.open + mailto 조합은 빈 탭이 남는 문제가 있어 <a> 클릭 방식 사용
    const link = document.createElement('a');
    link.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    link.click();
  };

  useEffect(() => {
    if (isLogin && roles?.isAdmin) fetchContacts();
  }, [isLogin, roles]);

  if (!isLogin || !roles?.isAdmin) return null;

  return (
    <div className="admin-marathon-container">
      {/* 헤더 */}
      <header className="admin-marathon-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> 대시보드
          </button>
        </div>
        <h1><MessageSquare size={24} /> 문의 관리</h1>
        <p>사용자 문의 내용을 확인하고 답변합니다. 총 {contacts.length}건</p>
      </header>

      {/* 로딩 */}
      {loading && (
        <div className="admin-loading">
          <Loader2 size={36} />
          <p>문의 내역을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {error && !loading && (
        <div className="admin-empty">
          <AlertCircle size={40} style={{ color: '#ef4444' }} />
          <p>{error}</p>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && !error && contacts.length === 0 && (
        <div className="admin-empty">
          <MessageSquare size={40} />
          <p>접수된 문의가 없습니다.</p>
        </div>
      )}

      {/* 문의 카드 리스트 */}
      {!loading && !error && contacts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map((c) => {
            const isExpanded = expandedId === c.id;
            const isLong = c.message && c.message.length > 100;

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--card-bg, #fff)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* 상단: 이름 + 이메일 + 액션 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {/* 아바타 */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(59,130,246,0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    color: '#3b82f6',
                  }}>
                    <User size={18} />
                  </div>

                  {/* 이름 + 이메일 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text, #1e293b)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {c.email}
                    </div>
                  </div>

                  {/* ID 뱃지 */}
                  <span style={{
                    fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)',
                    background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '2px 8px',
                  }}>
                    #{c.id}
                  </span>

                  {/* 액션 버튼들 */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="action-btn edit"
                      onClick={() => handleMailTo(c)}
                      title="메일로 답변"
                    >
                      <Mail size={13} /> 답변
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(c.id)}
                      title="삭제"
                    >
                      <Trash2 size={13} /> 삭제
                    </button>
                  </div>
                </div>

                {/* 메시지 본문 */}
                <div style={{
                  background: 'rgba(0,0,0,0.015)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--text, #1e293b)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: isExpanded || !isLong ? 'none' : '80px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {c.message}
                </div>

                {/* 더보기 버튼 */}
                {isLong && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600,
                      marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? <><ChevronUp size={14} /> 접기</> : <><ChevronDown size={14} /> 전체 보기</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminContact;
