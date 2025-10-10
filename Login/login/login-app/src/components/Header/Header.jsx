// src/components/Header/Header.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/header.css';
import { LoginContext } from '../../contexts/LoginContextProvider';
import logo from '../../assets/img/dorunninglogo.png';

const Header = () => {
  const { isLogin, logout } = useContext(LoginContext);

  return (
    <header>
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="DoRunning Logo" className="logo-img"/>
        </Link>
      </div>

      <div className="util">
        <ul>
          {isLogin ? (
            <>
              <li><a className="btn" href="/user" data-discover="true">마이페이지</a></li>
              <li><button className="btn" onClick={logout}>로그아웃</button></li>
            </>
          ) : (
            <>
              <li><a className="btn" href="/login" data-discover="true">로그인</a></li>
              <li><a className="btn" href="/join" data-discover="true">회원가입</a></li>
              <li><a className="btn" href="/about" data-discover="true">소개</a></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
