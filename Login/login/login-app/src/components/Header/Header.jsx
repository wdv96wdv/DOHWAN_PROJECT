import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/header.css';
import { LoginContext } from '../../contexts/LoginContextProvider';
import logo from '../../assets/img/dorunninglogo.png';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { Menu } from 'lucide-react'; // 햄버거 아이콘 (lucide-react 사용)

const Header = ({ theme, toggleTheme }) => {
  const { isLogin = false, logout = () => {} } = useContext(LoginContext) || {};
  const [menuOpen, setMenuOpen] = useState(false); // 모바일 메뉴 상태

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`header ${theme}`}>
      {/* 로고 */}
      <div className="logo-container">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="DoRunning Logo" className="logo-img" />
        </Link>
      </div>

      {/* 모바일용 햄버거 버튼 */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="메뉴 열기">
        <Menu size={28} />
      </button>

      {/* 유틸 메뉴 */}
      <div className={`util ${menuOpen ? 'active' : ''}`}>
        <ul>
          {isLogin ? (
            <>
              <li>
                <Link className="btn" to="/user" onClick={closeMenu}>
                  마이페이지
                </Link>
              </li>
              <li>
                <button className="btn" onClick={() => { logout(); closeMenu(); }}>
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="btn" to="/login" onClick={closeMenu}>
                  로그인
                </Link>
              </li>
              <li>
                <Link className="btn" to="/join" onClick={closeMenu}>
                  회원가입
                </Link>
              </li>
              <li>
                <Link className="btn" to="/about" onClick={closeMenu}>
                  소개
                </Link>
              </li>
            </>
          )}
          <li>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
