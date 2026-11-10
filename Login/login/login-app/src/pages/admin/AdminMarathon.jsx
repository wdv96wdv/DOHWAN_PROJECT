import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import Swal from 'sweetalert2';
import supabase from '../../utils/supabaseClient';
import { toWebp } from '../../utils/imageUtils';
import useAuthStore from '../../store/useAuthStore';
import '../../assets/css/admin-marathon.css';

const AdminMarathon = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const hasAlerted = useRef(false);

  const [marathons, setMarathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      Swal.fire({ icon: 'success', title: '삭제 완료', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: '삭제 실패', text: err.message });
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
  const filtered = marathons.filter(m =>
    !search || (m.title || '').toLowerCase().includes(search.toLowerCase())
  );

  // 통계
  const totalCount = marathons.length;
  const posterCount = marathons.filter(m => m.poster_url).length;
  const noPosterCount = totalCount - posterCount;

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
        <div className="admin-stat-card">
          <div className="stat-number">{totalCount}</div>
          <div className="stat-label">전체 대회</div>
        </div>
        <div className="admin-stat-card success">
          <div className="stat-number">{posterCount}</div>
          <div className="stat-label">포스터 등록</div>
        </div>
        <div className="admin-stat-card warning">
          <div className="stat-number">{noPosterCount}</div>
          <div className="stat-label">포스터 미등록</div>
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
            onChange={(e) => setSearch(e.target.value)}
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
                <th>포스터</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
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

                    {/* 포스터 상태 */}
                    <td>
                      <span className={`poster-status ${m.poster_url ? 'has' : 'none'}`}>
                        {m.poster_url ? '✓ 등록' : '미등록'}
                      </span>
                    </td>

                    {/* 액션 */}
                    <td>
                      <div className="action-btns">
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
      </div>
    </div>
  );
};

export default AdminMarathon;
