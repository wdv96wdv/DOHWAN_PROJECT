import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Join from './pages/Join'
import User from './pages/User'
import About from './pages/About'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Record from './pages/Record'
import LoginContextProvider from './contexts/LoginContextProvider'
import "./assets/css/common.css";
import "./assets/css/header.css";
import "./assets/css/Home.module.css";
import "./assets/css/login.css";
import "./assets/css/join.css";
import "./assets/css/user.css";
import "./assets/css/record.css";
import "./assets/css/footer.css";


const App = () => {
  return (
    <BrowserRouter>
      <LoginContextProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/user" element={<User />} />
            <Route path="/about" element={<About />} />
            <Route path="/record" element={<Record />} />
          </Routes>
          <Footer />
      </LoginContextProvider>
    </BrowserRouter>
  )
}

export default App