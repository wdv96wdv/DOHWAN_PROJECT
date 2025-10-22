import React, { useState, useEffect } from "react";

const Popup = ({ imageSrc, linkUrl, width = "300px", height = "auto", position = { top: "10%", left: "50%", transform: "translateX(-50%)" }, zIndex = 1000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("popupHideUntil");
    if (!hideUntil || new Date().getTime() > Number(hideUntil)) {
      setVisible(true);
    }
  }, []);

  const closePopup = (hideToday = false) => {
    if (hideToday) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      localStorage.setItem("popupHideUntil", endOfDay.getTime());
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "absolute", ...position, zIndex }}>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          position: "relative",
        }}
        onClick={() => closePopup()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            closePopup();
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            width: 24,
            height: 24,
            cursor: "pointer",
            fontWeight: "bold",
            color: "white",
          }}
        >
          X
        </button>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={imageSrc}
            alt="팝업 이미지"
            style={{ width, height, display: "block" }}
            onClick={(e) => e.stopPropagation()}
          />
        </a>
        <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePopup(true);
            }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              backgroundColor: "white",
            }}
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePopup();
            }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              cursor: "pointer",
              backgroundColor: "white",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
