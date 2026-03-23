import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/header.css';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/img/dorunninglogo.png';
import noImage from '../../assets/img/no-image.png'; // 기본 이미지 임포트 확인
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { Menu } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  const isLogin = useAuthStore(state => state.isLogin) || false;
  const logout = useAuthStore(state => state.logout) || (() => { });
  const roles = useAuthStore(state => state.roles);
  const userInfo = useAuthStore(state => state.userInfo);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  const isAdmin = roles?.isAdmin;

  const NavItems = () => (
    <ul className="nav-list">
      <li><Link to="/course" onClick={closeMenu}>코스</Link></li>
      <li><Link to={isLogin ? "/record" : "/login"} onClick={closeMenu}>기록</Link></li>
      <li><Link to="/marathon" onClick={closeMenu}>마라톤 일정</Link></li>
      <li><Link to={isLogin ? "/performance" : "/login"} onClick={closeMenu}>퍼포먼스</Link></li>
      <li><Link to="/event" onClick={closeMenu}>이벤트</Link></li>
      <li><Link to="/boards" onClick={closeMenu}>커뮤니티</Link></li>
      {isAdmin && <li><Link to="/admin" onClick={closeMenu}>관리자</Link></li>}
    </ul>
  );

  const UtilItems = () => (
    <ul className="util-list">
      {isLogin ? (
        <>
          <li>
            <Link to="/user" className="profile-link" onClick={closeMenu}>
              {/* ✅ avatarUrl 또는 avatar_url 중 하나라도 있으면 이미지 표시 */}
              {(userInfo?.avatarUrl || userInfo?.avatar_url) ? (
                <img
                  src={userInfo.avatarUrl || userInfo.avatar_url}
                  alt="프로필"
                  className="profile-image"
                  onError={(e) => { e.target.src = noImage; }}
                />
              ) : (
                <span className="btn">마이페이지</span>
              )}
            </Link>
          </li>
          <li><button className="btn" onClick={() => { logout(); closeMenu(); }}>로그아웃</button></li>
        </>
      ) : (
        <>
          <li><Link className="btn" to="/login" onClick={closeMenu}>로그인</Link></li>
          <li><Link className="btn" to="/join" onClick={closeMenu}>회원가입</Link></li>
          <li><Link className="btn" to="/about" onClick={closeMenu}>소개</Link></li>
        </>
      )}
    </ul>
  );

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="DoRunning Logo" className="logo-img" />
        </Link>
      </div>

      <nav className="main-menu PC-only">
        <NavItems />
      </nav>

      <div className="util PC-only">
        <UtilItems />
      </div>

      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        <Menu size={28} />
      </button>

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <nav className="main-menu">
          <NavItems />
        </nav>
        <div className="util">
          <UtilItems />
        </div>
      </div>
    </header>
  );
};

export default Header;