import React, { useState } from "react";
import styles from "../assets/css/Course.module.css";
import beginner from "../assets/img/beginner.jpg";
import ten from "../assets/img/ten.jpg";
import half from "../assets/img/half.jpg";
import RunningMap from "../components/Course/RunningMap";

const courses = [
  { id: 1, title: "초보자 러닝 코스", description: "석촌호수 한 바퀴 (약 2.5km)", image: beginner },
  { id: 2, title: "10km 준비 코스", description: "여의도 한강공원~마포대교 왕복", image: ten },
  { id: 3, title: "하프 마라톤 준비 코스", description: "뚝섬유원지~잠실~성수대교 왕복", image: half },
];

const Course = () => {
  // 선택된 코스 ID 배열로 관리 (여러 지도 동시에 열 수 있음)
  const [openMaps, setOpenMaps] = useState([]);

  const toggleMap = (courseId) => {
    setOpenMaps((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>코스</h2>
      </div>
      <section className={styles.hero}>

        <h1>나에게 맞는 코스를 찾아보세요!</h1>
        <p>초보자부터 전문가까지, 다양한 코스를 제공합니다.</p>
      </section>

      <section className={styles.courses}>
        <h2>코스 소개</h2>
        <div className={styles.courseList}>
          {courses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <div className={styles.courseImageContainer} onClick={() => toggleMap(course.id)}>
                <img src={course.image} alt={course.title} className={styles.courseImage} />
                <p className={styles.guideText}>👉 이미지를 클릭하면 코스 지도를 볼 수 있어요!</p>
                <div className={styles.overlay}>🗺️ 지도 보기</div>
              </div>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <p className={styles.courseDesc}>{course.description}</p>

              {/* 지도 열기/닫기 버튼 */}
              {openMaps.includes(course.id) && (
                <div className={styles.mapSection}>
                  <RunningMap courseId={course.id} />
                  <button className={styles.closeBtn} onClick={() => toggleMap(course.id)}>
                    닫기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Course;
