// src/pages/admin/AdminCourse.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  MapPin,
  Footprints,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Navigation
} from 'lucide-react';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import { getCourses, saveCourse, deleteCourse, uploadCourseImage } from '../../utils/courseService';
import { REGION_TABS } from '../../utils/courseData';
import '../../assets/css/admin-course.css';

const DEFAULT_COURSE_FORM = {
  id: null,
  title: '',
  region: 'Seoul',
  regionLabel: '서울',
  locationName: '',
  distanceKm: 5.0,
  distance: '5.0km',
  level: 'Beginner',
  courseType: '루프 (Loop)',
  surface: '우레탄 트랙',
  elevation: '완벽한 평지 (고도차 5m 이내)',
  description: '',
  tip: '',
  image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
  themeColor: '#2563eb',
  amenities: {
    toilet: true,
    water: true,
    locker: false,
    parking: true,
    nightLight: true
  },
  tags: '#초보환영, #평지코스',
  centerLat: 37.545,
  centerLng: 126.975
};

const AdminCourse = () => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const hasAlerted = useRef(false);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState(DEFAULT_COURSE_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Hidden File input for quick thumbnail change
  const quickFileInputRef = useRef(null);
  const quickTargetCourseId = useRef(null);

  // 1. 권한 체크
  useEffect(() => {
    if (hasAlerted.current) return;
    if (!isLogin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: '관리자 페이지는 로그인 후 이용 가능합니다.',
        confirmButtonColor: '#2563eb',
      }).then(() => navigate('/', { replace: true }));
      return;
    }
    if (!roles?.isAdmin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'error',
        title: '접근 제한',
        text: '관리자 권한이 필요합니다.',
        confirmButtonColor: '#2563eb',
      }).then(() => navigate('/', { replace: true }));
    }
  }, [isLogin, roles, navigate]);

  // 2. 코스 목록 로드
  const loadCourseData = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error('코스 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin && roles?.isAdmin) {
      loadCourseData();
    }
  }, [isLogin, roles]);

  // 필터링
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (regionFilter !== 'All' && c.region !== regionFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const tMatch = c.title?.toLowerCase().includes(q);
        const lMatch = c.regionLabel?.toLowerCase().includes(q) || c.locationName?.toLowerCase().includes(q);
        if (!tMatch && !lMatch) return false;
      }
      return true;
    });
  }, [courses, regionFilter, search]);

  // 페이징 계산
  const totalCourses = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCourses = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, safeCurrentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleRegionFilterChange = (e) => {
    setRegionFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // 통계 계산
  const stats = useMemo(() => {
    const total = courses.length;
    const official = courses.filter(c => c.region === 'Official').length;
    const regular = total - official;
    return { total, official, regular };
  }, [courses]);

  // 신규 등록 모달 열기
  const handleOpenNewModal = () => {
    setModalForm({
      ...DEFAULT_COURSE_FORM,
      id: null
    });
    setIsModalOpen(true);
  };

  // 기존 코스 수정 모달 열기
  const handleOpenEditModal = (course) => {
    setModalForm({
      id: course.id,
      title: course.title || '',
      region: course.region || 'Seoul',
      regionLabel: course.regionLabel || '',
      locationName: course.locationName || '',
      distanceKm: course.distanceKm || 5.0,
      distance: course.distance || `${course.distanceKm || 5.0}km`,
      level: course.level || 'Beginner',
      courseType: course.courseType || '루프 (Loop)',
      surface: course.surface || '우레탄 트랙',
      elevation: course.elevation || '완벽한 평지 (고도차 5m 이내)',
      description: course.description || '',
      tip: course.tip || '',
      image: course.image || '',
      themeColor: course.themeColor || '#2563eb',
      amenities: course.amenities || {
        toilet: true,
        water: true,
        locker: false,
        parking: true,
        nightLight: true
      },
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
      centerLat: course.center?.[0] || 37.545,
      centerLng: course.center?.[1] || 126.975
    });
    setIsModalOpen(true);
  };

  // 모달 저장 처리
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      Swal.fire({ icon: 'warning', title: '코스명을 입력해 주세요.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: modalForm.id,
        title: modalForm.title.trim(),
        region: modalForm.region,
        regionLabel: modalForm.regionLabel.trim() || modalForm.region,
        locationName: modalForm.locationName.trim(),
        distanceKm: parseFloat(modalForm.distanceKm) || 5.0,
        distance: `${parseFloat(modalForm.distanceKm) || 5.0}km`,
        level: modalForm.level,
        courseType: modalForm.courseType,
        surface: modalForm.surface,
        elevation: modalForm.elevation,
        description: modalForm.description.trim(),
        tip: modalForm.tip.trim(),
        image: modalForm.image.trim() || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
        themeColor: modalForm.themeColor,
        amenities: modalForm.amenities,
        tags: modalForm.tags.split(',').map(s => s.trim()).filter(Boolean),
        center: [parseFloat(modalForm.centerLat) || 37.545, parseFloat(modalForm.centerLng) || 126.975],
        coords: [
          [parseFloat(modalForm.centerLat) || 37.545, parseFloat(modalForm.centerLng) || 126.975],
          [(parseFloat(modalForm.centerLat) || 37.545) + 0.003, (parseFloat(modalForm.centerLng) || 126.975) + 0.004],
          [(parseFloat(modalForm.centerLat) || 37.545) + 0.006, (parseFloat(modalForm.centerLng) || 126.975) + 0.008]
        ],
        mapLinks: {
          kakao: `https://map.kakao.com/link/search/${encodeURIComponent(modalForm.locationName || modalForm.title)}`,
          naver: `https://map.naver.com/v5/search/${encodeURIComponent(modalForm.locationName || modalForm.title)}`
        }
      };

      await saveCourse(payload);
      await loadCourseData();
      setIsModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: modalForm.id ? '코스 수정 완료' : '코스 등록 완료',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('저장 실패:', err);
      Swal.fire({ icon: 'error', title: '저장 실패', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // 코스 삭제 처리
  const handleDelete = async (course) => {
    const res = await Swal.fire({
      icon: 'warning',
      title: '코스 삭제',
      html: `<b>[${course.title}]</b> 코스를 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (res.isConfirmed) {
      try {
        await deleteCourse(course.id);
        await loadCourseData();
        Swal.fire({ icon: 'success', title: '삭제되었습니다.', timer: 1200, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: '삭제 실패', text: err.message });
      }
    }
  };

  // 모달 내 이미지 파일 업로드 핸들러
  const handleModalImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const publicUrl = await uploadCourseImage(file);
      setModalForm(prev => ({ ...prev, image: publicUrl }));
      Swal.fire({ icon: 'success', title: '이미지가 적용되었습니다.', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: '이미지 업로드 실패', text: err.message });
    } finally {
      setUploadingImg(false);
    }
  };

  // 퀵 이미지 변경 (테이블 썸네일 클릭)
  const handleQuickImageClick = (courseId) => {
    quickTargetCourseId.current = courseId;
    quickFileInputRef.current?.click();
  };

  const handleQuickFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !quickTargetCourseId.current) return;

    try {
      Swal.fire({
        title: '이미지 최적화 및 저장 중...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const publicUrl = await uploadCourseImage(file);
      const targetCourse = courses.find(c => String(c.id) === String(quickTargetCourseId.current));
      if (targetCourse) {
        await saveCourse({ ...targetCourse, image: publicUrl });
        await loadCourseData();
        Swal.fire({ icon: 'success', title: '이미지가 변경되었습니다!', timer: 1200, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: '업로드 실패', text: err.message });
    } finally {
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  if (!isLogin || !roles?.isAdmin) return null;

  return (
    <div className="admin-course-page">
      {/* Hidden file input for quick thumbnail changes */}
      <input
        type="file"
        ref={quickFileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleQuickFileChange}
      />

      {/* Header */}
      <header className="admin-course-header">
        <div className="admin-course-header-left">
          <h1>
            <Footprints size={28} style={{ color: '#2563eb' }} /> 러닝 코스 관리
          </h1>
          <p>전국 러닝 성지와 메이저 대회 공식 코스를 등록하고 이미지를 수정·관리합니다.</p>
        </div>

        <div className="admin-course-header-actions">
          <button
            type="button"
            className="btn-admin-action secondary"
            onClick={() => navigate('/admin')}
          >
            <ChevronLeft size={16} /> 관리자 대시보드
          </button>
          <button
            type="button"
            className="btn-admin-action primary"
            onClick={handleOpenNewModal}
          >
            <Plus size={16} /> 신규 코스 등록
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <section className="admin-course-stats-row">
        <div className="admin-course-stat-card">
          <div className="admin-course-stat-icon blue">
            <Footprints size={24} />
          </div>
          <div>
            <div className="admin-course-stat-val">{stats.total}</div>
            <div className="admin-course-stat-lbl">전체 등록 코스</div>
          </div>
        </div>

        <div className="admin-course-stat-card">
          <div className="admin-course-stat-icon amber">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="admin-course-stat-val">{stats.official}</div>
            <div className="admin-course-stat-lbl">대회 공식 코스</div>
          </div>
        </div>

        <div className="admin-course-stat-card">
          <div className="admin-course-stat-icon green">
            <MapPin size={24} />
          </div>
          <div>
            <div className="admin-course-stat-val">{stats.regular}</div>
            <div className="admin-course-stat-lbl">일반 러닝 성지</div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="admin-course-filter-bar">
        <div className="admin-course-search-box">
          <Search size={16} className="admin-course-search-icon" />
          <input
            type="text"
            className="admin-course-search-input"
            placeholder="코스 이름, 지역명으로 검색..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="admin-course-region-select"
            value={regionFilter}
            onChange={handleRegionFilterChange}
          >
            {REGION_TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>

          <select
            className="admin-course-region-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            title="페이지당 표시 개수"
          >
            <option value={10}>10개씩 보기</option>
            <option value={20}>20개씩 보기</option>
            <option value={50}>50개씩 보기</option>
          </select>
        </div>
      </section>

      {/* Course Table */}
      <div className="admin-course-table-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <div>코스 데이터를 불러오는 중...</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            등록된 코스가 없습니다.
          </div>
        ) : (
          <table className="admin-course-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>썸네일</th>
                <th>코스명 / 위치</th>
                <th>지역</th>
                <th>거리 / 난이도</th>
                <th>노면 / 형태</th>
                <th>편의시설</th>
                <th style={{ width: '100px', textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map((c) => (
                <tr key={c.id}>
                  {/* Thumbnail & Quick Change */}
                  <td>
                    <div
                      className="admin-thumb-cell"
                      onClick={() => handleQuickImageClick(c.id)}
                      title="클릭하여 이미지 변경"
                    >
                      <img src={c.image} alt={c.title} className="admin-thumb-img" />
                      <div className="admin-thumb-overlay">
                        <Upload size={16} />
                      </div>
                    </div>
                  </td>

                  {/* Title & Location */}
                  <td>
                    <div className="admin-course-cell-title">
                      <span className="admin-course-cell-name">{c.title}</span>
                      <span className="admin-course-cell-loc">
                        <Navigation size={11} /> {c.locationName || '출발지 미정'}
                      </span>
                    </div>
                  </td>

                  {/* Region */}
                  <td>
                    <span className={`admin-badge ${c.region === 'Official' ? 'official' : ''}`}>
                      {c.regionLabel || c.region}
                    </span>
                  </td>

                  {/* Distance & Level */}
                  <td>
                    <div style={{ fontWeight: 700 }}>{c.distance}</div>
                    <span className={`admin-badge ${c.level?.toLowerCase() || 'beginner'}`}>
                      {c.level}
                    </span>
                  </td>

                  {/* Surface & Type */}
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.surface}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.courseType}</div>
                  </td>

                  {/* Amenities */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.amenities?.toilet && <span title="화장실">🚻</span>}
                      {c.amenities?.water && <span title="음수대">💧</span>}
                      {c.amenities?.locker && <span title="락커">🎒</span>}
                      {c.amenities?.parking && <span title="주차장">🅿️</span>}
                      {c.amenities?.nightLight && <span title="가로등">💡</span>}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="btn-icon-action edit"
                        onClick={() => handleOpenEditModal(c)}
                        title="코스 정보 수정"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => handleDelete(c)}
                        title="코스 삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Pagination Controls */}
      {totalPages > 1 && (
        <div className="admin-course-pagination">
          <span className="admin-course-page-info">
            전체 <strong>{totalCourses}</strong>개 중 <strong>{(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, totalCourses)}</strong>번째
          </span>

          <div className="admin-course-page-btns">
            <button
              type="button"
              className="admin-course-page-btn"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              title="첫 페이지"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className="admin-course-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              title="이전 페이지"
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
                  <span key={`dot-${i}`} className="admin-course-page-dots">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`admin-course-page-btn num ${p === safeCurrentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              type="button"
              className="admin-course-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              title="다음 페이지"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="admin-course-page-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              title="마지막 페이지"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Course Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modalForm.id ? '러닝 코스 수정' : '신규 러닝 코스 등록'}</h2>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="admin-modal-body">
              {/* Image Preview & Upload */}
              <div className="admin-form-group">
                <label>코스 대표 이미지</label>
                <div className="admin-img-upload-box">
                  <img
                    src={modalForm.image}
                    alt="Preview"
                    className="admin-img-preview"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="admin-img-upload-controls">
                    <label className="btn-admin-action secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <Upload size={14} /> {uploadingImg ? '업로드 중...' : '이미지 파일 업로드 (WebP 자동 변환)'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleModalImageUpload}
                        disabled={uploadingImg}
                      />
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="또는 이미지 URL 직접 입력..."
                      value={modalForm.image}
                      onChange={(e) => setModalForm(prev => ({ ...prev, image: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Title & Location */}
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>코스명 *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="예: 석촌호수 러닝 루프"
                    required
                    value={modalForm.title}
                    onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>출발지 위치 명칭</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="예: 잠실역 2번 출구 / 송파나루역 방면"
                    value={modalForm.locationName}
                    onChange={(e) => setModalForm(prev => ({ ...prev, locationName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Region & Region Label */}
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>지역 분류</label>
                  <select
                    className="admin-form-select"
                    value={modalForm.region}
                    onChange={(e) => setModalForm(prev => ({ ...prev, region: e.target.value }))}
                  >
                    <option value="Seoul">서울</option>
                    <option value="Gyeonggi">경기/인천</option>
                    <option value="Chungcheong">충청/대전</option>
                    <option value="Yeongnam">부산/대구/영남</option>
                    <option value="GangwonJeju">강원/제주</option>
                    <option value="Official">🏆 대회 공식 코스</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>상세 지역 표시 라벨</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="예: 서울 송파구, 경기 고양시"
                    value={modalForm.regionLabel}
                    onChange={(e) => setModalForm(prev => ({ ...prev, regionLabel: e.target.value }))}
                  />
                </div>
              </div>

              {/* Distance & Level */}
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>거리 (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="admin-form-input"
                    value={modalForm.distanceKm}
                    onChange={(e) => setModalForm(prev => ({ ...prev, distanceKm: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>난이도</label>
                  <select
                    className="admin-form-select"
                    value={modalForm.level}
                    onChange={(e) => setModalForm(prev => ({ ...prev, level: e.target.value }))}
                  >
                    <option value="Beginner">Beginner (초보/조깅)</option>
                    <option value="10K">10K (인기/빌드업)</option>
                    <option value="Half">Half (하프/중장거리)</option>
                    <option value="Full">Full (풀코스/LSD)</option>
                  </select>
                </div>
              </div>

              {/* Surface & Elevation */}
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>노면 상태</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="예: 우레탄 트랙, 아스팔트 로드"
                    value={modalForm.surface}
                    onChange={(e) => setModalForm(prev => ({ ...prev, surface: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>경사도 / 고저차</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="예: 완벽한 평지 (고도차 3m)"
                    value={modalForm.elevation}
                    onChange={(e) => setModalForm(prev => ({ ...prev, elevation: e.target.value }))}
                  />
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div className="admin-form-group">
                <label>러너 편의시설 구비 여부</label>
                <div className="admin-amenities-group">
                  <label className="admin-amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={modalForm.amenities?.toilet || false}
                      onChange={(e) => setModalForm(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, toilet: e.target.checked }
                      }))}
                    />
                    🚻 화장실
                  </label>

                  <label className="admin-amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={modalForm.amenities?.water || false}
                      onChange={(e) => setModalForm(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, water: e.target.checked }
                      }))}
                    />
                    💧 음수대
                  </label>

                  <label className="admin-amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={modalForm.amenities?.locker || false}
                      onChange={(e) => setModalForm(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, locker: e.target.checked }
                      }))}
                    />
                    🎒 락커/러너스테이션
                  </label>

                  <label className="admin-amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={modalForm.amenities?.parking || false}
                      onChange={(e) => setModalForm(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, parking: e.target.checked }
                      }))}
                    />
                    🅿️ 주차장
                  </label>

                  <label className="admin-amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={modalForm.amenities?.nightLight || false}
                      onChange={(e) => setModalForm(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, nightLight: e.target.checked }
                      }))}
                    />
                    💡 야간 가로등
                  </label>
                </div>
              </div>

              {/* Description & Pro Tip */}
              <div className="admin-form-group">
                <label>코스 소개 설명</label>
                <textarea
                  rows="3"
                  className="admin-form-textarea"
                  placeholder="코스에 대한 매력과 특징을 적어주세요..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>💡 러너 실전 팁</label>
                <textarea
                  rows="2"
                  className="admin-form-textarea"
                  placeholder="예: 5km 지점 언덕 구간에서 페이스를 아끼는 것이 좋습니다..."
                  value={modalForm.tip}
                  onChange={(e) => setModalForm(prev => ({ ...prev, tip: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div className="admin-form-group">
                <label>태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="예: #초보환영, #우레탄트랙, #야경명소"
                  value={modalForm.tags}
                  onChange={(e) => setModalForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              {/* Modal Footer */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-action secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-admin-action primary"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : (modalForm.id ? '수정 내용 저장' : '코스 등록하기')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourse;
