import React, { useState } from "react";
import beginner from "../assets/img/beginner.jpg";
import ten from "../assets/img/ten.jpg";
import half from "../assets/img/half.jpg";
import RunningMap from "../components/Course/RunningMap";
import "../assets/css/course.css";
import "../assets/css/auth.css";
import { Map, X, Info, Footprints } from 'lucide-react';

const courses = [
  { id: 1, title: "Beginner Course", description: "Seokchon Lake Loop (Approx. 2.5km)", image: beginner },
  { id: 2, title: "10K Prep Course", description: "Yeouido Han River Park ~ Mapo Bridge Round Trip", image: ten },
  { id: 3, title: "Half Marathon Course", description: "Ttukseom Resort ~ Jamsil ~ Seongsu Bridge Round Trip", image: half },
];

const Course = () => {
  const [openMaps, setOpenMaps] = useState([]);

  const toggleMap = (courseId) => {
    setOpenMaps((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className="course-page">
      <header className="course-header">
        <h1><Footprints size={40} style={{verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)'}} /> RUNNING ROUTES</h1>
        <p>Find the perfect course for your level, from beginners to pros.</p>
      </header>

      <div className="course-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-img-wrapper" onClick={() => toggleMap(course.id)}>
              <img src={course.image} alt={course.title} className="course-img" />
              <div className="course-overlay">
                <Map size={24} /> VIEW MAP
              </div>
            </div>
            
            <div className="course-body">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-desc">{course.description}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Info size={14} /> Click image to toggle map view
              </div>
            </div>

            {openMaps.includes(course.id) && (
              <div className="map-container">
                <div style={{ height: '300px', background: 'hsla(0,0%,50%,0.1)' }}>
                  <RunningMap courseId={course.id} />
                </div>
                <button className="btn-auth secondary" onClick={() => toggleMap(course.id)} style={{ width: '100%', borderRadius: 0, border: 'none' }}>
                  <X size={16} style={{marginRight: '8px'}} /> CLOSE MAP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Course;
