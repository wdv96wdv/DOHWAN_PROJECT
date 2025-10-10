import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/header.css';
import { LoginContext } from '../../contexts/LoginContextProvider';
import logo from '../../assets/img/dorunninglogo.png';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';

const Header = ({ theme, toggleTheme }) => {
  const { isLogin = false, logout = () => {} } = useContext(LoginContext) || {};

  return (
    <header className={`header ${theme}`}>
      <div className="logo-container">
        <Link to="/"><img src={logo} alt="DoRunning Logo" className="logo-img" /></Link>
      </div>
      <div className="util">
        <ul>
          {isLogin ? (
            <>
              <li><Link className="btn" to="/user">마이페이지</Link></li>
              <li><button className="btn" onClick={logout}>로그아웃</button></li>
            </>
          ) : (
            <>
              <li><Link className="btn" to="/login">로그인</Link></li>
              <li><Link className="btn" to="/join">회원가입</Link></li>
              <li><Link className="btn" to="/about">소개</Link></li>
            </>
          )}
          <li><ThemeToggle theme={theme} toggleTheme={toggleTheme} /></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
