// src/components/ThemeToggle/ThemeToggle.jsx
import React from 'react';
import styles from '../../assets/css/ThemeToggle.module.css';


const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button className={styles.toggleBtn} onClick={toggleTheme}>
      {theme === 'light' ? '🌞 라이트' : '🌙 다크'}
    </button>
  );
};

export default ThemeToggle;
