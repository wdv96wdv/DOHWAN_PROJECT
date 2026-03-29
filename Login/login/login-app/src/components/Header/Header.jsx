import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/header.css';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/img/dorunninglogo.png';
import noImage from '../../assets/img/no-image.png'; // 기본 이미지 임포트 확인
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { 
  Map, 
  Activity, 
  Trophy, 
  TrendingUp, 
  Gift, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn,
  UserPlus,
  Info,
  UserCircle
} from 'lucide-react';

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
      <li><Link to="/course" onClick={closeMenu}><Map size={20} /><span>코스</span></Link></li>
      <li><Link to={isLogin ? "/record" : "/login"} onClick={closeMenu}><Activity size={20} /><span>기록</span></Link></li>
      <li><Link to="/marathon" onClick={closeMenu}><Trophy size={20} /><span>마라톤 일정</span></Link></li>
      <li><Link to={isLogin ? "/performance" : "/login"} onClick={closeMenu}><TrendingUp size={20} /><span>퍼포먼스</span></Link></li>
      <li><Link to="/event" onClick={closeMenu}><Gift size={20} /><span>이벤트</span></Link></li>
      <li><Link to="/boards" onClick={closeMenu}><MessageSquare size={20} /><span>커뮤니티</span></Link></li>
      {isAdmin && <li><Link to="/admin" onClick={closeMenu}><ShieldCheck size={20} /><span>관리자</span></Link></li>}
    </ul>
  );

  const UtilItems = () => (
    <ul className="util-list">
      {isLogin ? (
        <li>
          <button className="btn-logout" onClick={() => { logout(); closeMenu(); }}>
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </li>
      ) : (
        <>
          <li><Link to="/login" onClick={closeMenu}><LogIn size={20} /><span>로그인</span></Link></li>
          <li><Link to="/join" onClick={closeMenu}><UserPlus size={20} /><span>회원가입</span></Link></li>
          <li><Link to="/about" onClick={closeMenu}><Info size={20} /><span>소개</span></Link></li>
        </>
      )}
    </ul>
  );

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          <div className="hamburger-box">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </button>

        <div className="logo-container">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="DoRunning Logo" className="logo-img" />
          </Link>
        </div>
      </div>

      <nav className="main-menu PC-only">
        <NavItems />
      </nav>

      <div className="header-right">
        <div className="util PC-only">
          <UtilItems />
        </div>
        
        {/* 유튜브 스타일 프로필 아바타 (상시 노출) */}
        {/* 유튜브 스타일 프로필 아바타 (상시 노출) */}
        {!isLogin ? (
          <div className="user-avatar-container mobile-only">
            <Link to="/login" onClick={closeMenu} className="header-avatar-link guest">
              <UserCircle size={32} className="header-avatar-icon" />
            </Link>
          </div>
        ) : (
          <div className="user-avatar-container">
            <Link to="/user" onClick={closeMenu} className="header-avatar-link">
              {(userInfo?.avatarUrl || userInfo?.avatar_url) ? (
                <img
                  src={userInfo.avatarUrl || userInfo.avatar_url}
                  alt="Profile"
                  className="header-avatar-img"
                  onError={(e) => { e.target.src = noImage; }}
                />
              ) : (
                <UserCircle size={32} className="header-avatar-icon" />
              )}
            </Link>
          </div>
        )}
      </div>

      {/* 모바일 메뉴 배경 레이어 */}
      <div 
        className={`mobile-backdrop ${menuOpen ? 'active' : ''}`} 
        onClick={closeMenu} 
      />

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
           <button className="menu-toggle" onClick={toggleMenu}>
              <div className="hamburger-box">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
           </button>
           <Link to="/" onClick={closeMenu}>
             <img src={logo} alt="DoRunning Logo" className="logo-img" />
           </Link>
        </div>
        
        <div className="mobile-menu-content">
          <nav className="mobile-nav-section">
            <div className="menu-section-label">NAVIGATE</div>
            <NavItems />
          </nav>
          
          <div className="menu-divider" />
          
          <nav className="mobile-nav-section">
            <div className="menu-section-label">ACCOUNT</div>
            <UtilItems />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;