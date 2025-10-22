import React, { useContext, useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import '../../assets/css/header.css';
import { LoginContext } from '../../contexts/LoginContextProvider';
import logo from '../../assets/img/dorunninglogo.png';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { Menu } from 'lucide-react'; // 햄버거 아이콘

const Header = ({ theme, toggleTheme }) => {
  // LoginContext에서 roles와 isLogin 가져오기
  const { isLogin = false, logout = () => {}, roles } = useContext(LoginContext) || {};
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 메뉴 상태
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  // ✅ 관리자 여부 확인
  const isAdmin = roles?.isAdmin; // roles.isAdmin이 true면 관리자 메뉴 표시

   // 기록 페이지 접근 처리
  const handleRecordClick = (e) => {
    if (!isLogin) {
      e.preventDefault();  // 기본 링크 동작 막기
      navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  };

  return (
    <header className={`header ${theme}`}>
      {/* 로고 */}
      <div className="logo-container">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="DoRunning Logo" className="logo-img" />
        </Link>
      </div>

      {/* PC 메뉴 */}
      <nav className="main-menu">
        <ul>
          <li><Link to="/course">코스</Link></li>
          {/* 로그인한 사용자만 접근 가능한 링크 */}
          <li><Link to="/record" onClick={handleRecordClick}>기록</Link></li>
          <li><Link to="/event">이벤트</Link></li>
          <li><Link to="/boards">커뮤니티</Link></li>

          {/* 관리자 메뉴 (ROLE_ADMIN만 표시) */}
          {isAdmin && <li><Link to="/admin">관리자</Link></li>}
        </ul>
      </nav>

      {/* PC 유틸 메뉴 */}
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
          {/* <li><ThemeToggle theme={theme} toggleTheme={toggleTheme} /></li> */}
        </ul>
      </div>

      {/* 모바일 햄버거 버튼 */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="메뉴 열기">
        <Menu size={28} />
      </button>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <ul className="main-menu">
          <li><Link to="/course" onClick={closeMenu}>코스</Link></li>
          {/* 로그인한 사용자만 접근 가능한 링크 */}
          <li><Link to="/record" onClick={handleRecordClick}>기록</Link></li>
          <li><Link to="/event" onClick={closeMenu}>이벤트</Link></li>
          <li><Link to="/boards" onClick={closeMenu}>커뮤니티</Link></li>
          {isAdmin && <li><Link to="/admin" onClick={closeMenu}>관리자</Link></li>}
        </ul>
        <ul className="util">
          {isLogin ? (
            <>
              <li><Link to="/user" onClick={closeMenu}>마이페이지</Link></li>
              <li><button onClick={() => { logout(); closeMenu(); }}>로그아웃</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMenu}>로그인</Link></li>
              <li><Link to="/join" onClick={closeMenu}>회원가입</Link></li>
              <li><Link to="/about" onClick={closeMenu}>소개</Link></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
