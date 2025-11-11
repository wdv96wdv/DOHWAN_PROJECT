import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginContextProvider from './contexts/LoginContextProvider';

const Home = lazy(() => import('./pages/Login/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Join = lazy(() => import('./pages/Login/Join'));
const User = lazy(() => import('./pages/Login/User'));
const Record = lazy(() => import('./pages/Login/Record'));

const Course = lazy(() => import('./pages/Course'));
const Event = lazy(() => import('./pages/Event'));

const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Contact = lazy(() => import('./pages/Contact'));

const AdminContact = lazy(() => import("./pages/admin/AdminContact"));
const Calendar = lazy(() => import('./pages/Calendar'));
const Profile = lazy(() => import('./pages/Profile'));

const Listpage = lazy(() => import('./pages/board/Listpage'));
const Insertpage = lazy(() => import('./pages/board/Insertpage'));
const Readpage = lazy(() => import('./pages/board/Readpage'));
const Updatepage = lazy(() => import('./pages/board/Updatepage'));
const Marathon = lazy(() => import('./pages/Marathon'));
const Recommend = lazy(() => import('./pages/Recommend/Recommend'));
const RecommendResult = lazy(() => import('./pages/Recommend/RecommendResult'));
const PerformanceTab = lazy(() => import('./pages/Performance/PerformanceTab'));

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';


import "./assets/css/common.css";
import "./assets/css/header.css";
import "./assets/css/Home.module.css";
import "./assets/css/login.css";
import "./assets/css/join.css";
import "./assets/css/user.css";
import "./assets/css/record.module.css";
import "./assets/css/footer.css";
import "./assets/css/Course.module.css"
import "./assets/css/Event.module.css"
import "./assets/css/profile.css"
import "./assets/css/Marathon.module.css"


const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <LoginContextProvider>
        <div className={`app ${theme}`}>
          <Header theme={theme} toggleTheme={toggleTheme} />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home theme={theme} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<Join />} />
              <Route path="/user" element={<User />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminContact />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/marathon" element={<Marathon />} />
              <Route path="/performance" element={<PerformanceTab />} />
              <Route path="/recommend" element={<Recommend />} />
              <Route path="/recommend/result" element={<RecommendResult />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/record" element={<Record />} />
              <Route path="/course" element={<Course />} />
              <Route path="/event" element={<Event />} />
              <Route path="/boards" element={<Listpage />} />
              <Route path="/boards/insert" element={<Insertpage />} />
              <Route path="/boards/:id" element={<Readpage />} />
              <Route path="/boards/update/:id" element={<Updatepage />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </LoginContextProvider>
    </BrowserRouter>
  );
};

export default App;
