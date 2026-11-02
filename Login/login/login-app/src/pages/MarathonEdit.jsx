import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Trophy,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Upload,
  AlertCircle,
  Edit3,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import supabase from '../utils/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import '../assets/css/marathon-register.css';

const REGION_OPTIONS = [
  '서울', '경기', '인천', '강원', '충북', '충남', '전북', '전남',
  '경북', '경남', '제주', '부산', '대구', '울산', '대전', '광주', '세종', '전국'
];

const AVAILABLE_TYPES = [
  'Full', 'Half', '10Km', '5Km', '3Km', '트레일러닝', '걷기'
];

export default function MarathonEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const roles = useAuthStore(state => state.roles);
  const isAdmin = Boolean(roles?.isAdmin);

  const [loadingData, setLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: '',
    raceDate: '',
    startDate: '',
    endDate: '',
    location: '서울',
    types: ['10Km'],
    link: '',
    posterUrl: '',
    isFirstCome: false,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalRaceDate, setOriginalRaceDate] = useState('');

  // 기존 데이터 불러오기
  useEffect(() => {
    if (!id) return;
    const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

    fetch(`${SUPABASE_URL}/rest/v1/marathons?id=eq.${id}&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    })
      .then(res => res.json())
      .then(rows => {
        if (!rows || rows.length === 0) {
          setNotFound(true);
          return;
        }
        const m = rows[0];
        const types = Array.isArray(m.type) ? m.type : (m.type ? [m.type] : ['10Km']);
        setOriginalTitle(m.title || '');
        setOriginalRaceDate(m.race_date || '');
        setForm({
          title: m.title || '',
          raceDate: m.race_date || '',
          startDate: m.start_date || '',
          endDate: m.end_date || '',
          location: m.location || '서울',
          types,
          link: m.link || '',
          posterUrl: m.poster_url || '',
          isFirstCome: m.is_first_come || false,
        });
        if (m.poster_url) setPreviewUrl(m.poster_url);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTypeToggle = (type) => {
    setForm(prev => {
      const exists = prev.types.includes(type);
      const updated = exists
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types: updated.length ? updated : ['10Km'] };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: '이미지 파일만 가능합니다', text: 'JPG, PNG, WebP 포맷의 이미지를 선택해 주세요.' });
      return;
    }
    setPosterFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) { Swal.fire({ icon: 'warning', title: '대회명을 입력해 주세요' }); return; }
    if (!form.raceDate) { Swal.fire({ icon: 'warning', title: '대회 개최 일자를 선택해 주세요' }); return; }
    if (!form.link.trim()) { Swal.fire({ icon: 'warning', title: '공식 참가신청/홈페이지 링크를 입력해 주세요' }); return; }
    if (!form.types.length) { Swal.fire({ icon: 'warning', title: '최소 1개 이상의 코스 종목을 선택해 주세요' }); return; }

    const linkVal = form.link.trim();
    const validLink = (linkVal.startsWith('http://') || linkVal.startsWith('https://'))
      ? linkVal : `https://${linkVal}`;

    setSubmitting(true);
    try {
      let finalPosterUrl = form.posterUrl || null;

      // 파일 업로드 시도
      if (posterFile) {
        try {
          const ext = posterFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('marathon-posters')
            .upload(fileName, posterFile, { cacheControl: '3600', upsert: false });
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('marathon-posters').getPublicUrl(fileName);
            finalPosterUrl = urlData?.publicUrl || finalPosterUrl;
          }
        } catch (uploadException) {
          console.warn('포스터 업로드 폴백:', uploadException);
        }
      }

      const updatePayload = {
        title: form.title.trim(),
        race_date: form.raceDate,
        start_date: form.startDate || form.raceDate,
        end_date: form.endDate || form.startDate || form.raceDate,
        location: form.location,
        type: form.types,
        link: validLink,
        is_first_come: form.isFirstCome,
        poster_url: finalPosterUrl,
      };

      const { error } = await supabase
        .from('marathons')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: '대회 정보가 수정되었습니다!',
        text: `대회명: ${form.title}`,
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '목록으로 이동',
      });
      navigate('/marathon');

    } catch (err) {
      console.error('마라톤 수정 실패:', err);
      Swal.fire({
        icon: 'error',
        title: '수정 중 오류가 발생했습니다',
        text: err?.message || '잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩 중
  if (loadingData) {
    return (
      <div className="marathon-register-container">
        <div className="register-card" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>대회 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (notFound) {
    return (
      <div className="marathon-register-container">
        <div className="register-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>대회를 찾을 수 없습니다</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>해당 ID의 마라톤 대회 정보가 존재하지 않습니다.</p>
          <button className="btn-submit" onClick={() => navigate('/marathon')}>목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="marathon-register-container">
      <Helmet>
        <title>{originalTitle ? `${originalTitle} 수정` : '마라톤 대회 수정'} | 두러닝</title>
      </Helmet>

      <header className="register-header">
        <div className={`register-badge ${isAdmin ? 'admin' : ''}`}>
          {isAdmin ? (
            <><ShieldCheck size={16} /><span>관리자 수정 모드</span></>
          ) : (
            <><Edit3 size={16} /><span>대회 정보 수정</span></>
          )}
        </div>
        <h1>마라톤 대회 정보 수정</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{originalTitle}</p>
      </header>

      <div className="register-card">
        <form onSubmit={handleSubmit}>
          {/* 섹션 1: 기본 정보 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <Trophy size={18} color="var(--primary)" /> 대회 기본 정보
            </h2>

            <div className="form-row single">
              <div className="form-group">
                <label>대회 공식 명칭 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <Trophy size={18} className="input-icon" />
                  <input
                    type="text" name="title" className="form-input"
                    placeholder="예) 2026 서울 하프 마라톤"
                    value={form.title} onChange={handleInputChange} required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>대회 개최 지역 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <select name="location" className="form-input" value={form.location} onChange={handleInputChange}>
                    {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>대회 개최 일자 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input type="date" name="raceDate" className="form-input"
                    value={form.raceDate} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 2: 접수 일정 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <Clock size={18} color="var(--primary)" /> 접수 일정 및 신청 링크
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>접수 시작일</label>
                <input type="date" name="startDate" className="form-input"
                  value={form.startDate} onChange={handleInputChange} />
                <span className="form-hint">미입력 시 대회일자와 동일하게 처리됩니다.</span>
              </div>
              <div className="form-group">
                <label>접수 마감일</label>
                <input type="date" name="endDate" className="form-input"
                  value={form.endDate} onChange={handleInputChange} />
                <span className="form-hint">선착순 조기 마감 대회의 경우 마감 예정일을 입력합니다.</span>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label>공식 참가신청 / 주최사 홈페이지 링크 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <LinkIcon size={18} className="input-icon" />
                  <input type="text" name="link" className="form-input"
                    placeholder="https://example-marathon.co.kr"
                    value={form.link} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="switch-wrapper">
                <div className="switch-label-area">
                  <span className="title">선착순 마감 대회</span>
                  <span className="sub">정원이 차면 조기 마감되는 대회일 경우 체크해 주세요.</span>
                </div>
                <label className="custom-switch">
                  <input type="checkbox" name="isFirstCome" checked={form.isFirstCome} onChange={handleInputChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 섹션 3: 종목 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <CheckCircle2 size={18} color="var(--primary)" /> 참가 종목 (중복 선택)
            </h2>
            <div className="type-chips-wrapper">
              {AVAILABLE_TYPES.map(t => {
                const selected = form.types.includes(t);
                return (
                  <button key={t} type="button"
                    className={`type-chip ${selected ? 'selected' : ''}`}
                    onClick={() => handleTypeToggle(t)}>
                    {selected ? `✓ ${t}` : t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 섹션 4: 포스터 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <ImageIcon size={18} color="var(--primary)" /> 대회 포스터 이미지
            </h2>
            <div className="poster-upload-area">
              <div className="poster-preview-box">
                {previewUrl || form.posterUrl ? (
                  <img src={previewUrl || form.posterUrl} alt="포스터 미리보기"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="placeholder-text">
                    <ImageIcon size={32} style={{ margin: '0 auto 6px', color: '#94a3b8' }} />
                    이미지 미리보기
                  </div>
                )}
              </div>

              <div className="poster-inputs">
                <div className="form-group">
                  <label>이미지 파일 직접 업로드</label>
                  <label className="file-upload-btn">
                    <Upload size={16} />
                    <span>PC에서 이미지 파일 선택</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                  <span className="form-hint">JPG, PNG, WebP 포스터 권장</span>
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label>또는 이미지 웹 URL 직접 입력</label>
                  <input type="text" name="posterUrl" className="form-input"
                    placeholder="https://example.com/poster.jpg"
                    value={form.posterUrl}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (!posterFile) setPreviewUrl(e.target.value);
                    }} />
                </div>

                {(form.posterUrl || previewUrl) && (
                  <button type="button" style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setForm(prev => ({ ...prev, posterUrl: '' })); setPreviewUrl(''); setPosterFile(null); }}>
                    🗑 포스터 제거
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="register-submit-area">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '저장 중...' : '✓ 수정 내용 저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

