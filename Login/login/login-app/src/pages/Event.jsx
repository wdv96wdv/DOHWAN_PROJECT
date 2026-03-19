import React, { useState } from "react";
import "../assets/css/event.css";
import "../assets/css/auth.css";
import { events } from "../utils/events";
import RunningMap from "../components/Event/EventRunningMap";
import { Calendar, MapPin, Map as MapIcon, X, Info, Star } from 'lucide-react';

const EventPage = () => {
  const [openMaps, setOpenMaps] = useState([]);

  const toggleMap = (eventId) => {
    setOpenMaps((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="event-page">
      <header className="event-header">
        <h1><Star size={40} style={{verticalAlign: 'middle', marginRight: '16px', color: 'var(--primary)'}} /> RUNNING EVENTS</h1>
        <p>Join our exclusive community events and challenges.</p>
      </header>

      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-img-wrapper" onClick={() => toggleMap(event.id)}>
              <img src={event.image} alt={event.title} className="event-img" />
              <div className="event-overlay">
                 <MapIcon size={24} /> VIEW ROUTE
              </div>
            </div>

            <div className="event-body">
              <h3 className="event-title">{event.title}</h3>
              
              <div className="event-meta">
                <div className="event-meta-item">
                  <Calendar size={16} color="var(--primary)" />
                  <span>{event.date}</span>
                </div>
                <div className="event-meta-item">
                  <MapPin size={16} color="var(--primary)" />
                  <span>{event.location}</span>
                </div>
              </div>

              <p className="event-desc">{event.shortDescription}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Info size={14} /> Click image to visualize route
              </div>
            </div>

            {openMaps.includes(event.id) && (
              <div className="map-container">
                <div style={{ height: '300px' }}>
                  <RunningMap coords={event.coords} />
                </div>
                <button className="btn-auth secondary" onClick={() => toggleMap(event.id)} style={{ width: '100%', borderRadius: 0, border: 'none' }}>
                  <X size={16} style={{marginRight: '8px'}} /> CLOSE ROUTE
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
