import React, { useState } from "react";
import styles from "../assets/css/Event.module.css";
import { events } from "../utils/events";
import RunningMap from "../components/Event/EventRunningMap";

const EventPage = () => {
  const [openMaps, setOpenMaps] = useState([]);

  const toggleMap = (eventId) => {
    setOpenMaps((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>이벤트</h2>

      <div className={styles.eventList}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventImageContainer} onClick={() => toggleMap(event.id)}>
              <img src={event.image} alt={event.title} className={styles.eventImage} />
              <p className={styles.guideText}>👉 이미지를 클릭하면 이벤트 코스를 볼 수 있어요!</p>
              <div className={styles.overlay}>🗺️ 지도 보기</div>
            </div>

            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventDate}>{event.date}</p>
            <p className={styles.eventLocation}>{event.location}</p>
            <p className={styles.eventDesc}>{event.shortDescription}</p>

            {openMaps.includes(event.id) && (
              <div className={styles.mapSection}>
                <RunningMap coords={event.coords} />
                <button className={styles.closeBtn} onClick={() => toggleMap(event.id)}>
                  닫기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPage;
