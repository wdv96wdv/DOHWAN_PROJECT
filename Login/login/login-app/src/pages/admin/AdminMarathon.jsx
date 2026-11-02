import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import { CalendarPlus, Pencil, Trash2, Save, X, ImagePlus } from 'lucide-react';
import '../../assets/css/auth.css';
import '../../assets/css/admin-marathon.css';
import Loading from '../../components/Common/Loading';
import * as marathonApi from '../../apis/marathons';
import { compressToWebp, formatBytes } from '../../utils/imageToWebp';

const REGIONS = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종',
  '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주', '전국',
];
const TYPES = ['Full', 'Half', '10Km', '5Km'];
const MAX_INPUT_BYTES = 20 * 1024 * 1024; // 원본은 20MB까지 (업로드 전에 WebP로 압축된다)

const emptyForm = {
  title: '',
  location: '',
  type: [],
  link: '',
  race_date: '',
  start_date: '',
  end_date: '',
  is_first_come: false,
  poster_url: '',
};

// 서버가 내려주는 에러 메시지를 우선 사용
const errorMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

const AdminMarathon = () => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [posterInfo, setPosterInfo] = useState('');
  const [compressing, setCompressing] = useState(false);
  const uploadedRef = useRef({ file: null, url: '' }); // 같은 파일을 다시 올리지 않기 위한 기록
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState('upcoming'); // upcoming | past | all
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await marathonApi.adminList();
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire('불러오기 실패', errorMessage(err, '대회 목록을 불러오지 못했습니다.'), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 선택한 포스터 미리보기 (메모리 누수 방지를 위해 URL 해제)
  useEffect(() => {
    if (!posterFile) return undefined;
    const url = URL.createObjectURL(posterFile);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const toggleType = (t) =>
    setForm((prev) => ({
      ...prev,
      type: prev.type.includes(t) ? prev.type.filter((x) => x !== t) : [...prev.type, t],
    }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPosterFile(null);
    setPosterPreview('');
    setPosterInfo('');
    uploadedRef.current = { file: null, url: '' };
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePosterChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('이미지 파일만 가능', '포스터는 이미지 파일만 올릴 수 있습니다.', 'warning');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      Swal.fire('파일이 너무 큽니다', '원본 이미지는 20MB 이하만 선택할 수 있습니다.', 'warning');
      e.target.value = '';
      return;
    }

    try {
      setCompressing(true);
      const result = await compressToWebp(file);
      setPosterFile(result.file);
      setPosterInfo(
        `WebP로 압축됨: ${formatBytes(result.originalSize)} → ${formatBytes(result.size)} (${result.width}×${result.height})`
      );
    } catch (err) {
      console.error(err);
      Swal.fire('이미지 처리 실패', err?.message || '이미지를 변환하지 못했습니다.', 'error');
      e.target.value = '';
    } finally {
      setCompressing(false);
    }
  };

  const clearPoster = () => {
    setPosterFile(null);
    setPosterPreview('');
    setPosterInfo('');
    uploadedRef.current = { file: null, url: '' };
    setField('poster_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 입력값 1차 검증 (서버에서도 다시 검증한다)
  const validate = () => {
    if (!form.title.trim()) return '대회명을 입력해 주세요.';
    if (!form.location) return '지역을 선택해 주세요.';
    if (form.type.length === 0) return '종목을 하나 이상 선택해 주세요.';
    if (!form.race_date) return '대회일을 입력해 주세요.';
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      return '접수 마감일은 접수 시작일보다 빠를 수 없습니다.';
    }
    if (form.link.trim() && !/^https?:\/\/\S+$/.test(form.link.trim())) {
      return '링크는 http:// 또는 https:// 로 시작해야 합니다.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const problem = validate();
    if (problem) {
      Swal.fire('입력 확인', problem, 'warning');
      return;
    }

    try {
      setSubmitting(true);

      let posterUrl = form.poster_url || '';
      if (posterFile) {
        if (uploadedRef.current.file === posterFile && uploadedRef.current.url) {
          // 저장에 실패해서 다시 시도하는 경우: 이미 올린 파일을 재사용
          posterUrl = uploadedRef.current.url;
        } else {
          const res = await marathonApi.uploadPoster(posterFile);
          posterUrl = res.data.url;
          uploadedRef.current = { file: posterFile, url: posterUrl };
        }
      }

      const payload = {
        title: form.title.trim(),
        location: form.location,
        type: form.type,
        link: form.link.trim() || null,
        race_date: form.race_date,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_first_come: form.is_first_come,
        poster_url: posterUrl || null,
      };

      if (editingId) {
        await marathonApi.adminUpdate(editingId, payload);
        await Swal.fire({ icon: 'success', title: '수정 완료', timer: 1200, showConfirmButton: false });
      } else {
        await marathonApi.adminCreate(payload);
        await Swal.fire({ icon: 'success', title: '등록 완료', timer: 1200, showConfirmButton: false });
      }

      resetForm();
      fetchList();
    } catch (err) {
      console.error(err);
      Swal.fire('저장 실패', errorMessage(err, err?.message || '저장 중 오류가 발생했습니다.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setForm({
      title: m.title || '',
      location: m.location || '',
      type: Array.isArray(m.type) ? m.type : [],
      link: m.link || '',
      race_date: m.race_date || '',
      start_date: m.start_date || '',
      end_date: m.end_date || '',
      is_first_come: !!m.is_first_come,
      poster_url: m.poster_url || '',
    });
    setPosterFile(null);
    setPosterPreview('');
    setPosterInfo('');
    uploadedRef.current = { file: null, url: '' };
    if (fileInputRef.current) fileInputRef.current.value = '';
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (m) => {
    const result = await Swal.fire({
      title: '이 대회를 삭제할까요?',
      text: `${m.title} (${m.race_date}) — 삭제하면 되돌릴 수 없습니다.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#f44336',
    });
    if (!result.isConfirmed) return;

    try {
      await marathonApi.adminRemove(m.id);
      setList((prev) => prev.filter((x) => x.id !== m.id));
      if (editingId === m.id) resetForm();
      Swal.fire({ icon: 'success', title: '삭제 완료', timer: 1000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('삭제 실패', errorMessage(err, '삭제 중 오류가 발생했습니다.'), 'error');
    }
  };

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return list.filter((m) => {
      if (scope === 'upcoming' && (m.race_date || '') < todayStr) return false;
      if (scope === 'past' && (m.race_date || '') >= todayStr) return false;
      if (kw && !(m.title || '').toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [list, keyword, scope, todayStr]);

  // 화면이 느려지지 않도록 한 번에 보여주는 개수 제한
  const VISIBLE_LIMIT = 100;
  const visible = filtered.slice(0, VISIBLE_LIMIT);

  return (
    <div className="am-page">
      <Helmet>
        <title>Dorunning | 마라톤 등록</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="am-header">
        <h1>
          <CalendarPlus size={30} className="am-header-icon" /> 마라톤 등록
        </h1>
        <p>관리자만 대회 일정을 등록·수정·삭제할 수 있습니다.</p>
      </header>

      <section className="am-card" ref={formRef}>
        <div className="am-card-title">
          {editingId ? `대회 수정 (ID ${editingId})` : '새 대회 등록'}
          {editingId && (
            <button type="button" className="am-link-btn" onClick={resetForm}>
              <X size={14} /> 수정 취소
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="am-form" noValidate>
          <div className="form-group am-span-2">
            <label htmlFor="am-title">대회명 *</label>
            <input
              id="am-title"
              className="form-control"
              value={form.title}
              maxLength={255}
              placeholder="예: 2026 서울 하프마라톤"
              onChange={(e) => setField('title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="am-location">지역 *</label>
            <select
              id="am-location"
              className="form-control"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
            >
              <option value="">선택</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="am-race-date">대회일 *</label>
            <input
              id="am-race-date"
              type="date"
              className="form-control"
              value={form.race_date}
              onChange={(e) => setField('race_date', e.target.value)}
            />
          </div>

          <div className="form-group am-span-2">
            <label>종목 *</label>
            <div className="am-chips">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`am-chip ${form.type.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleType(t)}
                  aria-pressed={form.type.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="am-start">접수 시작일</label>
            <input
              id="am-start"
              type="date"
              className="form-control"
              value={form.start_date}
              onChange={(e) => setField('start_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="am-end">접수 마감일</label>
            <input
              id="am-end"
              type="date"
              className="form-control"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={(e) => setField('end_date', e.target.value)}
            />
          </div>
          <p className="am-hint am-span-2">접수일을 비워두면 대회일 기준으로 저장됩니다.</p>

          <div className="form-group am-span-2">
            <label htmlFor="am-link">접수/공식 홈페이지 링크</label>
            <input
              id="am-link"
              type="url"
              className="form-control"
              value={form.link}
              placeholder="https://"
              onChange={(e) => setField('link', e.target.value)}
            />
          </div>

          <label className="am-check am-span-2">
            <input
              type="checkbox"
              checked={form.is_first_come}
              onChange={(e) => setField('is_first_come', e.target.checked)}
            />
            선착순 접수
          </label>

          <div className="form-group am-span-2">
            <label>포스터 (올리면 자동으로 WebP로 압축돼요)</label>
            <div className="am-poster-row">
              <label className="am-upload-btn">
                <ImagePlus size={16} /> {compressing ? '압축 중...' : '이미지 선택'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  disabled={compressing}
                  hidden
                />
              </label>
              {(posterPreview || form.poster_url) && (
                <>
                  <img
                    className="am-poster-preview"
                    src={posterPreview || form.poster_url}
                    alt="포스터 미리보기"
                  />
                  <button type="button" className="am-link-btn" onClick={clearPoster}>
                    <X size={14} /> 포스터 제거
                  </button>
                </>
              )}
            </div>
            {posterInfo && <p className="am-hint" style={{ margin: '4px 0 0' }}>{posterInfo}</p>}
          </div>

          <div className="am-actions am-span-2">
            <button type="submit" className="btn-auth" disabled={submitting || compressing}>
              <Save size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
              {submitting ? '저장 중...' : editingId ? '수정 저장' : '등록하기'}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={resetForm} disabled={submitting}>
                취소
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="am-card">
        <div className="am-card-title">등록된 대회 ({filtered.length})</div>

        <div className="am-toolbar">
          <input
            className="form-control"
            placeholder="대회명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="am-chips">
            {[
              ['upcoming', '예정'],
              ['past', '지난 대회'],
              ['all', '전체'],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={`am-chip ${scope === key ? 'active' : ''}`}
                onClick={() => setScope(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loading inline={true} text="대회 목록을 불러오는 중..." />
        ) : visible.length === 0 ? (
          <div className="am-empty">조건에 맞는 대회가 없습니다.</div>
        ) : (
          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>대회일</th>
                  <th>대회명</th>
                  <th>지역</th>
                  <th>종목</th>
                  <th>출처</th>
                  <th aria-label="관리" />
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id} className={editingId === m.id ? 'editing' : ''}>
                    <td className="am-nowrap">{m.race_date}</td>
                    <td>{m.title}</td>
                    <td className="am-nowrap">{m.location}</td>
                    <td className="am-nowrap">{(m.type || []).join(', ')}</td>
                    <td className="am-nowrap">
                      <span className={`am-badge ${m.source_type === 'admin' ? 'admin' : 'legacy'}`}>
                        {m.source_type === 'admin' ? '직접 등록' : '기존 데이터'}
                      </span>
                    </td>
                    <td className="am-row-actions">
                      <button type="button" className="am-icon-btn" onClick={() => handleEdit(m)} aria-label="수정">
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="am-icon-btn danger" onClick={() => handleDelete(m)} aria-label="삭제">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > VISIBLE_LIMIT && (
              <div className="am-hint">
                {filtered.length}개 중 {VISIBLE_LIMIT}개만 표시합니다. 검색으로 좁혀 주세요.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminMarathon;
