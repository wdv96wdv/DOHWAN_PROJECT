import React, { useState } from "react";
import { Helmet } from 'react-helmet-async';
import LeafletMap from "../components/Course/LeafletMap";
import { COURSE_LIST, REGION_LIST } from "../utils/courseData";
import { Map, X, Info, Footprints, MapPin } from 'lucide-react';
import "../assets/css/course.css";
import "../assets/css/auth.css";

const Course = () => {
  const [openMaps, setOpenMaps] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");

  const toggleMap = (courseId) => {
    setOpenMaps((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Filter courses based on selected region
  const filteredCourses = COURSE_LIST.filter(course => 
    selectedRegion === "All" || course.region === selectedRegion
  );

  return (
    <div className="course-page" style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '120px 20px' }}>
      <Helmet>
        <title>Dorunning | 코스</title>
        <meta name="description" content="전국의 아름다운 러닝 코스를 탐색하세요. 지역별, 난이도별 맞춤 코스 정보와 지도를 제공합니다." />
        <meta property="og:title" content="Dorunning | 코스" />
        <meta property="og:description" content="전국의 아름다운 러닝 코스를 탐색하세요." />
        <link rel="canonical" href="https://dorunning.vercel.app/course" />
      </Helmet>
      <header className="course-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '3rem', color: 'var(--text-primary)' }}>
          <Footprints size={40} style={{verticalAlign: 'middle', marginRight: '16px', color: '#00ffcc'}} /> 
          RUNNING ROUTES
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '16px' }}>
          Find the perfect course for your level in your desired region.
        </p>

        {/* Region Filter Section */}
        <div className="region-filter-container">
          <div className="region-select-wrapper">
             <MapPin size={18} className="region-select-icon" />
             <select 
               className="region-select"
               value={selectedRegion} 
               onChange={(e) => setSelectedRegion(e.target.value)}
             >
               {REGION_LIST.map(region => (
                 <option key={region} value={region}>
                   {region === "All" ? "전국 (All Regions)" : region}
                 </option>
               ))}
             </select>
          </div>
        </div>
      </header>

      <div className="course-grid">
        {filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '60px 0', gridColumn: '1 / -1' }}>
            해당 지역에 등록된 추천 코스가 없습니다.
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-img-wrapper" onClick={() => toggleMap(course.id)}>
                <img src={course.image} alt={course.title} className="course-img" />
                <div className="course-overlay">
                  <Map size={24} /> VIEW MAP
                </div>
                <div className="course-level-badge">{course.level}</div>
              </div>
              
              <div className="course-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Info size={14} /> Click image to toggle map view
                </div>
              </div>

              {openMaps.includes(course.id) && (
                <div className="map-container fade-in">
                  <div style={{ height: '350px', background: '#000' }}>
                    <LeafletMap 
                       courseId={course.id} 
                       coords={course.coords} 
                       center={course.center} 
                       themeColor={course.themeColor} 
                    />
                  </div>
                  <button className="btn-auth neon-btn" onClick={() => toggleMap(course.id)} style={{ width: '100%', borderRadius: 0, border: 'none', background: 'rgba(255,255,255,0.1)' }}>
                    <X size={16} style={{marginRight: '8px'}} /> CLOSE MAP
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Course;
