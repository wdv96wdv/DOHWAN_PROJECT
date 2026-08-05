import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuthStore from '../store/useAuthStore';
import Cookies from 'js-cookie';

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const SessionTimer = () => {
  const navigate = useNavigate();
  const { isLogin, logout, updateToken } = useAuthStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isLogin) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const checkSession = () => {
      if (isPopupOpen) return; // 이미 팝업이 열려있으면 중단

      const token = Cookies.get("jwt") || localStorage.getItem("jwt");
      if (!token) return;

      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return;

      const currentTime = Date.now() / 1000;
      const timeLeft = decoded.exp - currentTime;

      // 만료 5분(300초) 전부터 팝업 표시
      if (timeLeft <= 300 && timeLeft > 0) {
        showExtensionPopup(timeLeft);
      } else if (timeLeft <= 0) {
        // 이미 만료된 경우
        logout(false, navigate);
      }
    };

    timerRef.current = setInterval(checkSession, 10000); // 10초마다 체크

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLogin, isPopupOpen, navigate, logout]);

  const showExtensionPopup = (timeLeft) => {
    setIsPopupOpen(true);
    let timerInterval;

    Swal.fire({
      title: '세션 만료 알림',
      html: `로그인 세션이 <b></b> 초 후 만료됩니다.<br/>연장하시겠습니까?`,
      timer: timeLeft * 1000,
      timerProgressBar: true,
      showCancelButton: true,
      confirmButtonText: '연장하기',
      cancelButtonText: '로그아웃',
      allowOutsideClick: false,
      didOpen: () => {
        const b = Swal.getHtmlContainer().querySelector('b');
        timerInterval = setInterval(() => {
          b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      setIsPopupOpen(false);
      if (result.isConfirmed) {
        // 연장하기 클릭
        handleExtendSession();
      } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.timer) {
        // 로그아웃 클릭 또는 타이머 종료
        logout(false, navigate);
        Swal.fire('로그아웃', '세션이 만료되어 로그아웃되었습니다.', 'info');
      }
    });
  };

  const handleExtendSession = async () => {
    const success = await updateToken();
    if (success) {
      Swal.fire({
        icon: 'success',
        title: '연장 완료',
        text: '세션이 정상적으로 연장되었습니다.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      logout(false, navigate);
      Swal.fire('오류', '세션 연장에 실패했습니다. 다시 로그인해주세요.', 'error');
    }
  };

  return null; // UI를 렌더링하지 않는 백그라운드 컴포넌트
};

export default SessionTimer;
