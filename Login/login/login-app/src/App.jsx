import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginContextProvider from './contexts/LoginContextProvider';

import Home from './pages/Login/Home';
import Login from './pages/Login/Login';
import Join from './pages/Login/Join';
import User from './pages/Login/User';
import Record from './pages/Login/Record';

import Course from './pages/Course';
import Event from './pages/Event';

import About from './pages/About';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

import AdminContact from "./pages/admin/AdminContact";
import Calendar from './pages/Calendar';  

import Listpage from './pages/board/Listpage';
import Insertpage from './pages/board/Insertpage';
import Readpage from './pages/board/Readpage';
import Updatepage from './pages/board/Updatepage';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';


import "./assets/css/common.css";
import "./assets/css/header.css";
import "./assets/css/Home.module.css";
import "./assets/css/login.css";
import "./assets/css/join.css";
import "./assets/css/user.css";
import "./assets/css/record.css";
import "./assets/css/footer.css";
import "./assets/css/Course.module.css"
import "./assets/css/Event.module.css"

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <LoginContextProvider>
        <div className={`app ${theme}`}>
          <Header theme={theme} toggleTheme={toggleTheme} />
          <Routes>
            <Route path="/" element={<Home theme={theme} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<AdminContact />} />
            <Route path="/calendar" element={<Calendar />} />
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
          <Footer />
        </div>
      </LoginContextProvider>
    </BrowserRouter>
  );
};

export default App;
