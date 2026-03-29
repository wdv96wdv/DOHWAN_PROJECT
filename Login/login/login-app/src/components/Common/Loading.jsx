import React from 'react';
import '../../assets/css/Loading.css';
import loadingShoe from '../../assets/img/loading-shoe.png';

const Loading = ({ text = "LOADING DATA..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-img-wrapper">
          <img src={loadingShoe} alt="Loading..." className="loading-img" />
          <div className="loading-glow"></div>
        </div>
        <div className="loading-text">{text}</div>
      </div>
    </div>
  );
};

export default Loading;
