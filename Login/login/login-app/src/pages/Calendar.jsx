import React, { useState } from 'react';
import '../assets/css/Calendar.css';  // 스타일을 따로 분리

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const generateCalendar = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const calendar = [];
  let currentDay = startDate;

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

  const handleDateClick = (clickedDate) => {
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
    setInput('');
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}>◁</button>
        <h3>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</h3>
        <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}>▷</button>
      </div>
      <div className="calendar-days">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
        {calendarDays.map((day) => (
          <div
            key={day}
            className="calendar-day"
            onClick={() => handleDateClick(day)}
          >
            <span>{day.getDate()}</span>
            {exercise[day.toDateString()] && <div className="exercise-record">✅</div>}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>{selectedDate.toDateString()}</h4>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="운동 기록을 입력하세요."
            />
            <button onClick={handleSaveRecord}>저장</button>
            <button onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCalendar;
