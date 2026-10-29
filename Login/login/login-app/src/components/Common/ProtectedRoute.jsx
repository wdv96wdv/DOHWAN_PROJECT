import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({
  children,
  message = '로그인 후 이용 가능합니다.',
  adminOnly = false
}) => {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const hasAlerted = useRef(false);

  useEffect(() => {
    if (hasAlerted.current) return;

    if (!isLogin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: message,
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/', { replace: true });
      });
      return;
    }

    if (adminOnly && !roles?.isAdmin) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'error',
        title: '접근 제한',
        text: '관리자 권한이 필요합니다.',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLogin, roles, adminOnly, message, navigate]);

  if (!isLogin || (adminOnly && !roles?.isAdmin)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

