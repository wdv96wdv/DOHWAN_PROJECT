import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AppRouter from './router/AppRouter';
import AdBanner from './components/Common/AdBanner';
import SessionTimer from './components/SessionTimer';
import "./assets/css/common.css";
import './App.css';

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <SessionTimer />
      <div className={`app ${theme}`}>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="content">
          <AppRouter theme={theme} />
        </main>
        <AdBanner />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
