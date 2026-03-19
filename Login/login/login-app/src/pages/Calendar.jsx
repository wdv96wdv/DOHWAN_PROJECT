import React, { useState } from 'react';
import '../assets/css/Calendar.css';
import "../assets/css/auth.css";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, X, Activity } from 'lucide-react';

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const generateCalendar = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const calendar = [];
  
  // Fill leading empty days
  const startDay = startDate.getDay();
  for (let i = 0; i < startDay; i++) {
    calendar.push(null);
  }

  let currentDay = new Date(startDate);
  while (currentDay <= endDate) {
    calendar.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return calendar;
};

const ExerciseCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [exercise, setExercise] = useState({});
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarDays = generateCalendar(date.getFullYear(), date.getMonth());
  const today = new Date();

  const handleDateClick = (clickedDate) => {
    if (!clickedDate) return;
    const dateString = clickedDate.toDateString();
    setSelectedDate(clickedDate);
    setInput(exercise[dateString] || '');
    setShowModal(true);
  };

  const handleSaveRecord = () => {
    const dateString = selectedDate.toDateString();
    setExercise({
      ...exercise,
      [dateString]: input,
    });
    setShowModal(false);
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarIcon color="var(--primary)" />
          {date.toLocaleString('default', { month: 'long' }).toUpperCase()} {date.getFullYear()}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="calendar-nav-btn" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}>
            <ChevronLeft size={20} />
          </button>
          <button className="calendar-nav-btn" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day-label">{day}</div>
        ))}
        {calendarDays.map((day, idx) => {
          const isToday = day && day.toDateString() === today.toDateString();
          const hasRecord = day && exercise[day.toDateString()];

          return (
            <div
              key={idx}
              className={`calendar-cell ${isToday ? 'today' : ''}`}
              onClick={() => handleDateClick(day)}
              style={{ visibility: day ? 'visible' : 'hidden' }}
            >
              {day && (
                <>
                  <span className="day-num">{day.getDate()}</span>
                  {hasRecord && <div className="exercise-indicator"></div>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'Orbitron', fontSize: '1rem' }}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h4>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20}/></button>
            </header>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Activity size={14} /> EXERCISE LOG
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How was your run today? Enter your record here..."
              className="form-control"
              style={{ minHeight: '150px' }}
            />
            
            <button className="btn-auth" onClick={handleSaveRecord} style={{ padding: '12px' }}>
              <Save size={18} style={{marginRight: '8px'}} /> SAVE RECORD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCalendar;
