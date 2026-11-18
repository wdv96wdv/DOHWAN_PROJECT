// src/pages/Course.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import LeafletMap from "../components/Course/LeafletMap";
import { 
  COURSE_LIST, 
  REGION_TABS, 
  DISTANCE_FILTERS, 
  THEME_TAGS 
} from "../utils/courseData";
import { getCourses } from "../utils/courseService";
import { downloadCourseGpx } from "../utils/gpxHelper";
import useAuthStore from "../store/useAuthStore";
import { 
  Footprints, 
  MapPin, 
  Map, 
  Download, 
  Search, 
  X, 
  ExternalLink, 
  Sparkles,
  Navigation,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import "../assets/css/course.css";

const Course = () => {
  const navigate = useNavigate();
  const roles = useAuthStore((state) => state.roles);

  const [courses, setCourses] = useState(COURSE_LIST);
  const [openMaps, setOpenMaps] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState("All");
  const [selectedTag, setSelectedTag] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  // Load courses dynamically from service
  useEffect(() => {
    let isMounted = true;
    getCourses().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMap = (courseId) => {
    setOpenMaps((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleDownloadGpx = (course, e) => {
    e.stopPropagation();
    const success = downloadCourseGpx(course);
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'GPX 파일 다운로드 완료!',
        html: `<b>${course.title}</b> 코스 GPX 파일이 다운로드되었습니다.<br/><span style="font-size:0.85rem;color:#888;">가민 커넥트(Garmin), 애플워치(Workout), 스트라바 등에 불러와 내비게이션 러닝에 활용하세요.</span>`,
        confirmButtonColor: '#00ffcc',
        confirmButtonText: '확인'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '다운로드 실패',
        text: '파일 다운로드 중 오류가 발생했습니다.',
        confirmButtonColor: '#ff1744'
      });
    }
  };

  // Filter logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Region filter
      if (selectedRegion !== "All" && course.region !== selectedRegion) {
        return false;
      }

      // Distance filter
      if (selectedDistance === "Short" && course.distanceKm > 5.0) return false;
      if (selectedDistance === "Medium" && (course.distanceKm <= 5.0 || course.distanceKm > 10.0)) return false;
      if (selectedDistance === "Long" && course.distanceKm < 10.0) return false;

      // Theme tag filter
      if (selectedTag !== "전체" && !course.tags?.includes(selectedTag)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const titleMatch = course.title?.toLowerCase().includes(query);
        const regionMatch = course.regionLabel?.toLowerCase().includes(query);
        const descMatch = course.description?.toLowerCase().includes(query);
        const tipMatch = course.tip?.toLowerCase().includes(query);
        if (!titleMatch && !regionMatch && !descMatch && !tipMatch) {
          return false;
        }
      }

      return true;
    });
  }, [courses, selectedRegion, selectedDistance, selectedTag, searchQuery]);

  // Pagination calculation
  const totalCourses = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCourses = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, safeCurrentPage, PAGE_SIZE]);

  const handleRegionChange = (key) => {
    setSelectedRegion(key);
    setCurrentPage(1);
  };

  const handleDistanceChange = (key) => {
    setSelectedDistance(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="course-page">
      <Helmet>
        <title>전국 추천 러닝 코스 & GPX 다운로드 | 두러닝</title>
        <meta 
          name="description" 
          content="서울 석촌호수, 한강, 남산, 부산 광안리부터 JTBC·서울마라톤 공식 코스까지! 전국 러너 추천 코스 정보, 편의시설(화장실·음수대·락커), 가민/애플워치용 GPX 다운로드를 제공합니다." 
        />
        <meta property="og:title" content="전국 추천 러닝 코스 & GPX 다운로드 | 두러닝" />
        <meta property="og:description" content="전국 인기 러닝 코스 지도와 실전 러닝 팁, 편의시설 및 GPX 다운로드." />
        <link rel="canonical" href="https://www.dorunning.app/course" />
      </Helmet>

      {/* Hero Header */}
      <header className="course-header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div className="course-header-badge" style={{ marginBottom: 0 }}>
            <Sparkles size={14} /> KOREA RUNNING ROUTES & GPX
          </div>
          {roles?.isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                cursor: 'pointer'
              }}
            >
              <Settings size={14} /> 코스 관리자 모드
            </button>
          )}
        </div>
        <h1>RUNNING ROUTES</h1>
        <p className="course-header-desc">
          서울·전국 대표 러닝 성지와 메이저 마라톤 대회 실전 코스를 한눈에 확인하세요.<br/>
          스마트워치에 넣고 뛸 수 있는 <b>GPX 파일 다운로드</b>와 <b>화장실·락커 등 러너 편의시설</b> 정보를 제공합니다.
        </p>

        {/* Search Bar */}
        <div className="course-search-wrapper">
          <Search size={18} className="course-search-icon" />
          <input
            type="text"
            className="course-search-input"
            placeholder="코스 이름, 지역(한강, 석촌호수, 부산, 남산 등) 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="course-search-clear" onClick={() => handleSearchChange("")}>
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Filter Section */}
      <section className="course-filter-container">
        {/* Region Tabs */}
        <div className="course-region-tabs">
          {REGION_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`region-tab-btn ${selectedRegion === tab.key ? "active" : ""}`}
              onClick={() => handleRegionChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Distance Chips & Theme Tags */}
        <div className="course-subfilters">
          <div className="distance-filter-group">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px' }}>거리:</span>
            {DISTANCE_FILTERS.map((df) => (
              <button
                key={df.key}
                className={`distance-chip ${selectedDistance === df.key ? "active" : ""}`}
                onClick={() => handleDistanceChange(df.key)}
              >
                {df.label}
              </button>
            ))}
          </div>

          <div className="course-result-count">
            추천 코스 <b>{filteredCourses.length}</b>개
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <main className="course-grid">
        {filteredCourses.length === 0 ? (
          <div className="course-empty-state">
            <Footprints size={48} className="course-empty-icon" />
            <h3>조건에 맞는 코스가 없습니다.</h3>
            <p>검색어나 필터를 재설정해 보세요.</p>
          </div>
        ) : (
          paginatedCourses.map((course) => {
            const isMapOpen = openMaps.includes(course.id);
            const levelClass = course.level?.toLowerCase() || 'beginner';

            return (
              <article key={course.id} className="course-card">
                {/* Image Section */}
                <div className="course-img-wrapper" onClick={() => toggleMap(course.id)}>
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="course-img" 
                    loading="lazy" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  
                  <div className={`course-badge-level ${levelClass}`}>
                    {course.level}
                  </div>
                  
                  <div className="course-badge-region">
                    <MapPin size={12} /> {course.regionLabel}
                  </div>

                  <div className="course-img-overlay-tip">
                    <Map size={18} /> {isMapOpen ? "지도 닫기" : "지도 코스 보기"}
                  </div>
                </div>

                {/* Body Content */}
                <div className="course-body">
                  <div className="course-title-row">
                    <h3 className="course-title">{course.title}</h3>
                    <span className="course-distance-pill">{course.distance}</span>
                  </div>

                  <div className="course-location-sub">
                    <Navigation size={13} /> {course.locationName}
                  </div>

                  {/* Course Specs */}
                  <div className="course-specs-strip">
                    <div className="course-spec-item">
                      <span className="course-spec-label">형태</span>
                      <span className="course-spec-value">{course.courseType}</span>
                    </div>
                    <div className="course-spec-item">
                      <span className="course-spec-label">노면</span>
                      <span className="course-spec-value">{course.surface}</span>
                    </div>
                    <div className="course-spec-item">
                      <span className="course-spec-label">경사도</span>
                      <span className="course-spec-value">{course.elevation}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="course-amenities-bar">
                    <span className={`amenity-pill ${course.amenities?.toilet ? "enabled" : ""}`} title="화장실">
                      🚻 화장실
                    </span>
                    <span className={`amenity-pill ${course.amenities?.water ? "enabled" : ""}`} title="음수대">
                      💧 음수대
                    </span>
                    <span className={`amenity-pill ${course.amenities?.locker ? "enabled" : ""}`} title="물품보관소">
                      🎒 락커
                    </span>
                    <span className={`amenity-pill ${course.amenities?.parking ? "enabled" : ""}`} title="주차장">
                      🅿️ 주차
                    </span>
                    <span className={`amenity-pill ${course.amenities?.nightLight ? "enabled" : ""}`} title="야간조명">
                      💡 가로등
                    </span>
                  </div>

                  <p className="course-desc">{course.description}</p>

                  {/* Pro Tip Box */}
                  {course.tip && (
                    <div className="course-pro-tip">
                      <span>💡</span>
                      <span>{course.tip}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="course-tags-row">
                    {course.tags?.map((t, idx) => (
                      <span key={idx} className="course-tag">{t}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="course-actions-row">
                    <button 
                      type="button"
                      className={`btn-course-action map-toggle ${isMapOpen ? "active" : ""}`}
                      onClick={() => toggleMap(course.id)}
                    >
                      <Map size={16} /> {isMapOpen ? "지도 닫기" : "지도 보기"}
                    </button>

                    <button 
                      type="button"
                      className="btn-course-action gpx-download"
                      onClick={(e) => handleDownloadGpx(course, e)}
                      title="스마트워치용 GPX 파일 다운로드"
                    >
                      <Download size={16} /> GPX 다운로드
                    </button>
                  </div>

                  {/* External Map Directions */}
                  <div className="course-map-links-row">
                    <span>출발지 길찾기:</span>
                    <a 
                      href={course.mapLinks?.kakao} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="course-map-link"
                    >
                      카카오맵 <ExternalLink size={11} />
                    </a>
                    <span>·</span>
                    <a 
                      href={course.mapLinks?.naver} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="course-map-link"
                    >
                      네이버지도 <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Leaflet Map Viewer */}
                {isMapOpen && (
                  <div className="map-container fade-in">
                    <div style={{ height: '340px', background: '#0b0b0b' }}>
                      <LeafletMap 
                        courseId={course.id} 
                        coords={course.coords} 
                        center={course.center} 
                        themeColor={course.themeColor} 
                      />
                    </div>
                    <div className="map-control-bar">
                      <span>🚩 초록: 출발지점 | 🏁 빨강: 도착지점</span>
                      <button 
                        type="button" 
                        className="map-close-btn" 
                        onClick={() => toggleMap(course.id)}
                      >
                        <X size={14} /> 지도 닫기
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </main>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="course-pagination">
          <span className="course-page-info">
            전체 <strong>{totalCourses}</strong>개 코스 중 <strong>{(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, totalCourses)}</strong>번째
          </span>

          <div className="course-page-btns">
            <button
              type="button"
              className="course-page-btn"
              onClick={() => {
                setCurrentPage(1);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              disabled={safeCurrentPage === 1}
              title="첫 페이지"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className="course-page-btn"
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
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
                  <span key={`dot-${i}`} className="course-page-dots">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`course-page-btn num ${p === safeCurrentPage ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              type="button"
              className="course-page-btn"
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              disabled={safeCurrentPage === totalPages}
              title="다음 페이지"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="course-page-btn"
              onClick={() => {
                setCurrentPage(totalPages);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              disabled={safeCurrentPage === totalPages}
              title="마지막 페이지"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
