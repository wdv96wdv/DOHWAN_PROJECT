import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Calendar,
  MapPin,
  Trophy,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import supabase from '../../utils/supabaseClient';
import { toWebp } from '../../utils/imageUtils';
import useAuthStore from '../../store/useAuthStore';
import '../../assets/css/admin-marathon.css';

const AdminMarathon = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const hasAlerted = useRef(false);

  const [marathons, setMarathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    ['all', 'approved', 'pending', 'rejected'].includes(initialStatus) ? initialStatus : 'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetId = useRef(null);

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
        confirmButtonText: '확인',
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
        confirmButtonText: '확인',
      }).then(() => navigate('/', { replace: true }));
    }
  }, [isLogin, roles, navigate]);

  // 데이터 로드
  const fetchMarathons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marathons')
        .select('*')
        .order('race_date', { ascending: false });

      if (error) throw error;
      setMarathons(data || []);
    } catch (err) {
      console.error('마라톤 목록 로드 실패:', err);
      Swal.fire({ icon: 'error', title: '데이터 로드 실패', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin && roles?.isAdmin) {
      fetchMarathons();
    }
  }, [isLogin, roles]);

  // 삭제
  const handleDelete = async (marathon) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '정말 삭제하시겠습니까?',
      html: `<b>${marathon.title}</b> (${marathon.race_date})<br><br>삭제된 데이터는 복구할 수 없습니다.`,
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('marathons')
        .delete()
        .eq('id', marathon.id);

      if (error) throw error;

      setMarathons(prev => prev.filter(m => m.id !== marathon.id));
      window.dispatchEvent(new Event('marathons-updated'));
      Swal.fire({ icon: 'success', title: '삭제 완료', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: '삭제 실패', text: err.message });
    }
  };

  // 승인/거절
  const handleStatusChange = async (marathon, newStatus) => {
    const labels = { approved: '승인', rejected: '거절', pending: '대기' };
    const result = await Swal.fire({
      icon: newStatus === 'approved' ? 'question' : 'warning',
      title: `${labels[newStatus]}하시겠습니까?`,
      html: `<b>${marathon.title}</b>`,
      showCancelButton: true,
      confirmButtonText: labels[newStatus],
      cancelButtonText: '취소',
      confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('marathons')
        .update({ status: newStatus })
        .eq('id', marathon.id);

      if (error) throw error;

      setMarathons(prev =>
        prev.map(m => m.id === marathon.id ? { ...m, status: newStatus } : m)
      );
      window.dispatchEvent(new Event('marathons-updated'));
      Swal.fire({ icon: 'success', title: `${labels[newStatus]} 완료`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: '처리 실패', text: err.message });
    }
  };

  // 포스터 업로드 트리거
  const triggerUpload = (marathonId) => {
    uploadTargetId.current = marathonId;
    fileInputRef.current?.click();
  };

  // 포스터 파일 선택 핸들러
  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    const targetId = uploadTargetId.current;
    if (!file || !targetId) return;

    // 입력 리셋
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: '이미지 파일만 업로드 가능합니다' });
      return;
    }

    setUploadingId(targetId);

    try {
      // WebP 변환
      const webpBlob = await toWebp(file, 1200, 0.85);
      const fileName = `poster_${targetId}_${Date.now()}.webp`;

      // Supabase Storage 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posters')
        .upload(fileName, webpBlob, { contentType: 'image/webp', cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // 공개 URL 획득
      const { data: urlData } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error('URL 생성 실패');

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('marathons')
        .update({ poster_url: publicUrl })
        .eq('id', targetId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMarathons(prev =>
        prev.map(m => m.id === targetId ? { ...m, poster_url: publicUrl } : m)
      );

      Swal.fire({ icon: 'success', title: '포스터 업로드 완료!', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error('포스터 업로드 실패:', err);
      Swal.fire({
        icon: 'error',
        title: '업로드 실패',
        text: err.message || '스토리지 버킷(posters)이 생성되어 있는지 확인해 주세요.',
      });
    } finally {
      setUploadingId(null);
    }
  };

  // 필터링
  const filtered = marathons.filter(m => {
    const matchSearch = !search || (m.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (m.status || 'approved') === statusFilter;
    return matchSearch && matchStatus;
  });

  // 페이징
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  // 필터/검색 변경 시 1페이지로
  const updateSearch = (val) => { setSearch(val); setCurrentPage(1); };
  const updateStatusFilter = (val) => { setStatusFilter(val); setCurrentPage(1); };

  // 통계
  const totalCount = marathons.length;
  const pendingCount = marathons.filter(m => m.status === 'pending').length;
  const approvedCount = marathons.filter(m => (m.status || 'approved') === 'approved').length;
  const posterCount = marathons.filter(m => m.poster_url).length;

  if (!isLogin || !roles?.isAdmin) return null;

  return (
    <div className="admin-marathon-container">
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handlePosterUpload}
      />

      {/* 헤더 */}
      <header className="admin-marathon-header">
        <h1><ShieldCheck size={24} /> 마라톤 대회 관리</h1>
        <p>등록된 마라톤 일정을 관리하고 포스터 이미지를 업로드합니다.</p>
      </header>

      {/* 통계 */}
      <div className="admin-stats-bar">
        <div className={`admin-stat-card ${statusFilter === 'all' ? 'active-filter' : ''}`} onClick={() => updateStatusFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{totalCount}</div>
          <div className="stat-label">전체 대회</div>
        </div>
        <div className={`admin-stat-card success ${statusFilter === 'approved' ? 'active-filter' : ''}`} onClick={() => updateStatusFilter('approved')} style={{ cursor: 'pointer' }}>
          <div className="stat-number">{approvedCount}</div>
          <div className="stat-label">✅ 승인됨</div>
        </div>
        {pendingCount > 0 && (
          <div className={`admin-stat-card warning ${statusFilter === 'pending' ? 'active-filter' : ''}`} onClick={() => updateStatusFilter('pending')} style={{ cursor: 'pointer' }}>
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-label">⏳ 승인 대기</div>
          </div>
        )}
        <div className="admin-stat-card">
          <div className="stat-number">{posterCount}</div>
          <div className="stat-label">포스터 등록</div>
        </div>
      </div>

      {/* 툴바 */}
      <div className="admin-toolbar">
        <div className="admin-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="대회명으로 검색..."
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/marathon/register')}
        >
          <Plus size={16} /> 새 대회 등록
        </button>
      </div>

      {/* 테이블 */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <Loader2 size={36} />
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <AlertCircle size={40} />
            <p>{search ? '검색 결과가 없습니다.' : '등록된 대회가 없습니다.'}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>포스터</th>
                <th>대회명</th>
                <th>지역</th>
                <th>개최일</th>
                <th>접수기간</th>
                <th>종목</th>
                <th>상태</th>
                <th>포스터</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(m => {
                const types = Array.isArray(m.type) ? m.type : (m.type ? [m.type] : []);
                const isUploading = uploadingId === m.id;

                return (
                  <tr key={m.id}>
                    {/* 포스터 썸네일 */}
                    <td>
                      {m.poster_url ? (
                        <img
                          src={m.poster_url}
                          alt=""
                          className="poster-thumb"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="poster-empty">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>

                    {/* 대회명 */}
                    <td className="marathon-title-cell">
                      <div className="title-text">{m.title}</div>
                    </td>

                    {/* 지역 */}
                    <td>{m.location || '-'}</td>

                    {/* 개최일 */}
                    <td style={{ whiteSpace: 'nowrap' }}>{m.race_date || '-'}</td>

                    {/* 접수기간 */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {m.start_date && m.end_date
                        ? `${m.start_date} ~ ${m.end_date}`
                        : m.start_date || m.end_date || '-'}
                    </td>

                    {/* 종목 */}
                    <td>
                      <div className="type-badge-row">
                        {types.map(t => (
                          <span key={t} className="type-badge-sm">{t}</span>
                        ))}
                      </div>
                    </td>

                    {/* 승인 상태 */}
                    <td>
                      <span className={`status-badge ${m.status || 'approved'}`}>
                        {(m.status || 'approved') === 'approved' ? '✅ 승인' :
                         m.status === 'pending' ? '⏳ 대기' : '❌ 거절'}
                      </span>
                    </td>

                    {/* 포스터 상태 */}
                    <td>
                      <span className={`poster-status ${m.poster_url ? 'has' : 'none'}`}>
                        {m.poster_url ? '✓ 등록' : '미등록'}
                      </span>
                    </td>

                    {/* 액션 */}
                    <td>
                      <div className="action-btns">
                        {(m.status === 'pending' || m.status === 'rejected') && (
                          <button
                            className="action-btn approve"
                            onClick={() => handleStatusChange(m, 'approved')}
                            title="승인"
                          >
                            ✅ 승인
                          </button>
                        )}
                        {(m.status === 'pending' || (m.status || 'approved') === 'approved') && (
                          <button
                            className="action-btn reject"
                            onClick={() => handleStatusChange(m, m.status === 'pending' ? 'rejected' : 'pending')}
                            title={m.status === 'pending' ? '거절' : '승인 취소'}
                          >
                            {m.status === 'pending' ? '❌ 거절' : '⏸ 대기'}
                          </button>
                        )}
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/marathon/edit/${m.id}`)}
                          title="수정"
                        >
                          <Edit3 size={13} /> 수정
                        </button>

                        <button
                          className={`action-btn upload ${isUploading ? 'uploading' : ''}`}
                          onClick={() => triggerUpload(m.id)}
                          title="포스터 업로드"
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 size={13} /> : <Upload size={13} />}
                          {isUploading ? '...' : '포스터'}
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(m)}
                          title="삭제"
                        >
                          <Trash2 size={13} /> 삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 페이징 */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="admin-pagination">
            <span className="page-info">
              {filtered.length}건 중 {(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)}
            </span>
            <div className="page-btns">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                title="처음"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                title="이전"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="page-dots">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`page-btn num ${p === safeCurrentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                title="다음"
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                title="마지막"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarathon;
