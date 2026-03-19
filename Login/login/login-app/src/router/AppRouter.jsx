import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy loaded components
const Home = lazy(() => import('../pages/Login/Home'));
const Login = lazy(() => import('../pages/Login/Login'));
const Join = lazy(() => import('../pages/Login/Join'));
const User = lazy(() => import('../pages/Login/User'));
const Record = lazy(() => import('../pages/Login/Record'));
const Course = lazy(() => import('../pages/Course'));
const Event = lazy(() => import('../pages/Event'));
const About = lazy(() => import('../pages/About'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Contact = lazy(() => import('../pages/Contact'));
const AdminContact = lazy(() => import("../pages/admin/AdminContact"));
const Calendar = lazy(() => import('../pages/Calendar'));
const Listpage = lazy(() => import('../pages/board/Listpage'));
const Insertpage = lazy(() => import('../pages/board/Insertpage'));
const Readpage = lazy(() => import('../pages/board/Readpage'));
const Updatepage = lazy(() => import('../pages/board/Updatepage'));
const Marathon = lazy(() => import('../pages/Marathon'));
const Recommend = lazy(() => import('../pages/Recommend/Recommend'));
const RecommendResult = lazy(() => import('../pages/Recommend/RecommendResult'));
const PerformanceTab = lazy(() => import('../pages/Performance/PerformanceTab'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));

const AppRouter = ({ theme }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/user" element={<User />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin" element={<AdminContact />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/marathon" element={<Marathon />} />
        <Route path="/performance" element={<PerformanceTab />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/recommend/result" element={<RecommendResult />} />
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
    </Suspense>
  );
};

export default AppRouter;
