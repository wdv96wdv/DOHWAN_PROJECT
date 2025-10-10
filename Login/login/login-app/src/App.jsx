import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import LoginContextProvider from './contexts/LoginContextProvider'

// page import
import Home from './pages/Login/Home'
import Login from './pages/Login/Login'
import Join from './pages/Login/Join'
import User from './pages/Login/User'
import About from './pages/Login/About'
import Record from './pages/Login/Record'

// board page import
import Listpage from './pages/board/Listpage'
import Insertpage from './pages/board/Insertpage'
import Readpage from './pages/board/Readpage'
import Updatepage from './pages/board/Updatepage'


// 공통 컴포넌트
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'


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
          {/* 기본 페이지 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/user" element={<User />} />
          <Route path="/about" element={<About />} />
          <Route path="/record" element={<Record />} />

          {/* 게시판 페이지 */}
          <Route path="/boards" element={<Listpage />} />
          <Route path="/boards/insert" element={<Insertpage />} />
          <Route path="/boards/:id" element={<Readpage />} />
          <Route path="/boards/update/:id" element={<Updatepage />} />
        </Routes>
          <Footer />
      </LoginContextProvider>
    </BrowserRouter>
  )
}

export default App