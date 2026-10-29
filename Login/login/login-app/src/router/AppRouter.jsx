import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '../components/Common/Loading';
import ProtectedRoute from '../components/Common/ProtectedRoute';

// Lazy loaded components
const Home = lazy(() => import('../pages/Login/Home'));
const Login = lazy(() => import('../pages/Login/Login'));
const Join = lazy(() => import('../pages/Login/Join'));
const User = lazy(() => import('../pages/Login/User'));
const Record = lazy(() => import('../pages/Login/Record'));
const KakaoCallback = lazy(() => import('../pages/Login/KakaoCallback'));
const Course = lazy(() => import('../pages/Course'));
const Event = lazy(() => import('../pages/Event'));
const About = lazy(() => import('../pages/About'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Contact = lazy(() => import('../pages/Contact'));
const AdminContact = lazy(() => import("../pages/admin/AdminContact"));
// const Calendar = lazy(() => import('../pages/Calendar')); // 현재 미사용으로 비활성화
const Listpage = lazy(() => import('../pages/board/Listpage'));
const Insertpage = lazy(() => import('../pages/board/Insertpage'));
const Readpage = lazy(() => import('../pages/board/Readpage'));
const Updatepage = lazy(() => import('../pages/board/Updatepage'));
const Marathon = lazy(() => import('../pages/Marathon'));
const MarathonDetail = lazy(() => import('../pages/MarathonDetail')); // 추가
const PerformanceTab = lazy(() => import('../pages/Performance/PerformanceTab'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const GuideList = lazy(() => import('../pages/Guide/GuideList'));
const GuideDetail = lazy(() => import('../pages/Guide/GuideDetail'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRouter = ({ theme }) => {
  return (
    <Suspense fallback={<Loading text="페이지를 준비하고 있습니다..." />}>
      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/kakao" element={<KakaoCallback />} />
        <Route path="/join" element={<Join />} />
        <Route path="/user" element={<ProtectedRoute message="마이페이지는 로그인 후 이용 가능합니다."><User /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute message="위시리스트는 로그인 후 이용 가능합니다."><WishlistPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true} message="관리자 권한이 필요합니다."><AdminContact /></ProtectedRoute>} />
        {/* <Route path="/calendar" element={<Calendar />} /> */}
        <Route path="/marathon" element={<Marathon />} />
        <Route path="/marathon/:id" element={<MarathonDetail />} /> {/* 상세 페이지 추가 */}
        <Route path="/guide" element={<GuideList />} />
        <Route path="/guide/:id" element={<GuideDetail />} />
        <Route path="/performance" element={<ProtectedRoute message="퍼포먼스 페이지는 로그인 후 이용 가능합니다."><PerformanceTab /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/record" element={<ProtectedRoute message="기록 페이지는 로그인 후 이용 가능합니다."><Record /></ProtectedRoute>} />
        <Route path="/course" element={<Course />} />
        <Route path="/event" element={<Event />} />
        <Route path="/boards" element={<Listpage />} />
        <Route path="/boards/insert" element={<ProtectedRoute message="게시글 작성은 로그인 후 이용 가능합니다."><Insertpage /></ProtectedRoute>} />
        <Route path="/boards/:id" element={<Readpage />} />
        <Route path="/boards/update/:id" element={<ProtectedRoute message="게시글 수정은 로그인 후 이용 가능합니다."><Updatepage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
