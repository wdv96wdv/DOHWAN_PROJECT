import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
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

// 향후 관리자만 등록 가능하도록 잠그려면 이 값을 true로 변경하시면 됩니다.
const REQUIRE_ADMIN_ONLY = false;

export default function MarathonRegister() {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const isAdmin = Boolean(roles?.isAdmin);

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

  // 관리자 권한 잠금 체크 (REQUIRE_ADMIN_ONLY가 true일 경우 활성화)
  if (REQUIRE_ADMIN_ONLY && !isAdmin) {
    return (
      <div className="marathon-register-container">
        <div className="register-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            관리자 전용 기능입니다
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            마라톤 일정 등록은 관리자(Admin) 권한을 가진 계정만 이용하실 수 있습니다.
          </p>
          <button className="btn-submit" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      Swal.fire({
        icon: 'error',
        title: '이미지 파일만 가능합니다',
        text: 'JPG, PNG, WebP 포맷의 이미지를 선택해 주세요.'
      });
      return;
    }

    setPosterFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire({ icon: 'warning', title: '대회명을 입력해 주세요' });
      return;
    }
    if (!form.raceDate) {
      Swal.fire({ icon: 'warning', title: '대회 개최 일자를 선택해 주세요' });
      return;
    }
    if (!form.link.trim()) {
      Swal.fire({ icon: 'warning', title: '공식 참가신청/홈페이지 링크를 입력해 주세요' });
      return;
    }
    if (!form.types.length) {
      Swal.fire({ icon: 'warning', title: '최소 1개 이상의 코스 종목을 선택해 주세요' });
      return;
    }

    let validLink = form.link.trim();
    if (!validLink.startsWith('http://') && !validLink.startsWith('https://')) {
      validLink = `https://${validLink}`;
    }

    setSubmitting(true);

    try {
      let finalPosterUrl = form.posterUrl.trim();

      // 파일 업로드 처리 (Supabase Storage 연결 시도)
      if (posterFile) {
        try {
          const fileExt = posterFile.name.split('.').pop();
          const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `posters/${cleanName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('marathon-posters')
            .upload(filePath, posterFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadErr && uploadData) {
            const { data: publicData } = supabase.storage
              .from('marathon-posters')
              .getPublicUrl(filePath);
            finalPosterUrl = publicData.publicUrl;
          }
        } catch (uploadException) {
          console.warn('포스터 스토리지 업로드 폴백:', uploadException);
        }
      }

      // Supabase marathons 테이블 저장
      const insertPayload = {
        title: form.title.trim(),
        race_date: form.raceDate,
        start_date: form.startDate || form.raceDate,
        end_date: form.endDate || form.startDate || form.raceDate,
        location: form.location,
        type: form.types,
        link: validLink,
        is_first_come: form.isFirstCome,
        poster_url: finalPosterUrl || null,
        source: 'manual', // 직접 등록한 데이터 표시
      };

      const { data, error } = await supabase
        .from('marathons')
        .insert([insertPayload])
        .select();

      if (error) {
        // 중복 키 오류 (PostgreSQL unique violation: 23505)
        if (error.code === '23505' || error.message?.includes('unique_marathon')) {
          const confirmResult = await Swal.fire({
            icon: 'warning',
            title: '이미 등록된 대회입니다',
            html: `<b>${insertPayload.title}</b> (${insertPayload.race_date}) 대회가 이미 존재합니다.<br><br>기존 정보를 업데이트하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '정보 업데이트',
            cancelButtonText: '취소',
            confirmButtonColor: 'var(--primary)',
            cancelButtonColor: '#64748b',
          });

          if (!confirmResult.isConfirmed) {
            setSubmitting(false);
            return;
          }

          // 기존 레코드 업데이트 (upsert)
          const { data: upsertData, error: upsertError } = await supabase
            .from('marathons')
            .upsert([insertPayload], { onConflict: 'title,race_date' })
            .select();

          if (upsertError) throw upsertError;

          await Swal.fire({
            icon: 'success',
            title: '대회 정보가 업데이트되었습니다!',
            text: `대회명: ${form.title}`,
            confirmButtonColor: 'var(--primary)',
          });
          navigate('/marathon');
          return;
        }

        // 기타 오류
        throw error;
      }

      const insertedId = data?.[0]?.id;

      Swal.fire({
        icon: 'success',
        title: '마라톤 대회가 성공적으로 등록되었습니다!',
        text: `대회명: ${form.title}`,
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: '#64748b',
        confirmButtonText: '마라톤 목록으로 이동',
        cancelButtonText: '추가 등록하기'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/marathon');
        } else {
          // 폼 초기화
          setForm({
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
          setPosterFile(null);
          setPreviewUrl('');
        }
      });

    } catch (err) {
      console.error('마라톤 등록 실패:', err);
      Swal.fire({
        icon: 'error',
        title: '등록 중 오류가 발생했습니다',
        text: err?.message || '잠시 후 다시 시도해 주세요.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="marathon-register-container">
      <Helmet>
        <title>마라톤 대회 등록 | 두러닝</title>
        <meta name="description" content="두러닝에 새로운 전국 마라톤·러닝 대회 일정을 직접 등록하고 관리하세요." />
      </Helmet>

      <header className="register-header">
        <div className={`register-badge ${isAdmin ? 'admin' : ''}`}>
          {isAdmin ? (
            <>
              <ShieldCheck size={16} />
              <span>관리자 등록 모드 (즉시 반영)</span>
            </>
          ) : (
            <>
              <Trophy size={16} />
              <span>대회 등록 및 제보</span>
            </>
          )}
        </div>
        <h1>마라톤 대회 일정 등록</h1>
        <p>전국의 러너들을 위해 새로운 마라톤 대회 정보를 등록해 주세요.</p>
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
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="예) 2026 서울 하프 마라톤, 제15회 춘천 마라톤"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>대회 개최 지역 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <select
                    name="location"
                    className="form-input"
                    value={form.location}
                    onChange={handleInputChange}
                  >
                    {REGION_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>대회 개최 일자 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    name="raceDate"
                    className="form-input"
                    value={form.raceDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 2: 참가 신청 및 기간 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <Clock size={18} color="var(--primary)" /> 접수 일정 및 신청 링크
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>접수 시작일</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={form.startDate}
                  onChange={handleInputChange}
                />
                <span className="form-hint">미입력 시 대회일자와 동일하게 처리됩니다.</span>
              </div>

              <div className="form-group">
                <label>접수 마감일</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={form.endDate}
                  onChange={handleInputChange}
                />
                <span className="form-hint">선착순 조기 마감 대회의 경우 마감 예정일을 입력합니다.</span>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label>공식 참가신청 / 주최사 홈페이지 링크 <span className="required">*</span></label>
                <div className="input-with-icon">
                  <LinkIcon size={18} className="input-icon" />
                  <input
                    type="text"
                    name="link"
                    className="form-input"
                    placeholder="https://example-marathon.co.kr"
                    value={form.link}
                    onChange={handleInputChange}
                    required
                  />
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
                  <input
                    type="checkbox"
                    name="isFirstCome"
                    checked={form.isFirstCome}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 섹션 3: 종목 선택 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <CheckCircle2 size={18} color="var(--primary)" /> 참가 종목 (중복 선택)
            </h2>
            <div className="type-chips-wrapper">
              {AVAILABLE_TYPES.map(t => {
                const selected = form.types.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    className={`type-chip ${selected ? 'selected' : ''}`}
                    onClick={() => handleTypeToggle(t)}
                  >
                    {selected ? `✓ ${t}` : t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 섹션 4: 포스터 이미지 */}
          <div className="form-section">
            <h2 className="form-section-title">
              <ImageIcon size={18} color="var(--primary)" /> 대회 포스터 이미지
            </h2>

            <div className="poster-upload-area">
              <div className="poster-preview-box">
                {previewUrl || form.posterUrl ? (
                  <img
                    src={previewUrl || form.posterUrl}
                    alt="포스터 미리보기"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
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
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="form-hint">JPG, PNG, WebP 포스터 권장</span>
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label>또는 이미지 웹 URL 직접 입력</label>
                  <input
                    type="text"
                    name="posterUrl"
                    className="form-input"
                    placeholder="https://example.com/poster.jpg"
                    value={form.posterUrl}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (!posterFile) setPreviewUrl(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 등록 버튼 */}
          <div className="register-submit-area">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/marathon')}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '마라톤 일정 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

