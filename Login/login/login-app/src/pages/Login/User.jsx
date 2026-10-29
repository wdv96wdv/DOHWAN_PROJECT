import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserForm from '../../components/User/UserForm';
import useAuthStore from '../../store/useAuthStore';
import * as auth from '../../apis/auth';
import * as SwalAlert from '../../apis/alert';
import { Helmet } from 'react-helmet-async';

const User = () => {
  const isLogin = useAuthStore(state => state.isLogin);
  const logout = useAuthStore(state => state.logout);
  const userInfo = useAuthStore(state => state.userInfo);
  const updateUserInfo = useAuthStore(state => state.updateUserInfo);
  const navigate = useNavigate();
  const hasAlerted = useRef(false);

  // 비로그인 접근 차단 (URL 직접 접근 방지: 경고 알럿 후 메인 이동)
  useEffect(() => {
    if (!isLogin && !hasAlerted.current) {
      hasAlerted.current = true;
      Swal.fire({
        icon: 'warning',
        title: '로그인이 필요합니다',
        text: '마이페이지는 로그인 후 이용 가능합니다.',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [isLogin, navigate]);

  // 회원 정보 수정
  const updateUser = async (form) => {
    const { username, name, email, avatarUrl, bio,
      currentPassword, newPassword, confirmPassword } = form;

    const isPasswordChange = !!(newPassword && confirmPassword);

    try {
      // 이제 백엔드에서 avatarUrl과 bio도 함께 처리합니다.
      const response = await auth.update({
        username, name, email, avatarUrl, bio,
        currentPassword, newPassword, confirmPassword
      });

      if (response.status !== 200) {
        SwalAlert.alert('회원정보 수정 실패', '회원 정보 수정에 실패했습니다.', 'error');
        return;
      }

      if (isPasswordChange) {
        SwalAlert.alert('회원정보 수정 성공', '비밀번호가 변경되어 로그아웃 후 다시 로그인해주세요.', 'success', () => logout(true));
      } else {
        // 전역 상태 갱신 (헤더 아바타 등 즉시 반영)
        await updateUserInfo();
        SwalAlert.alert('회원정보 수정 성공', '정보가 정상적으로 수정되었습니다.', 'success');
        navigate('/');
      }

    } catch (error) {
      console.error('회원정보 수정 중 에러:', error);
      SwalAlert.alert('회원정보 수정 실패', '예기치 못한 오류가 발생했습니다.', 'error');
    }
  };

  // 회원 탈퇴
  const deleteUser = async (username) => {
    try {
      const response = await auth.remove(username);
      if (response?.status === 200) {
        SwalAlert.alert('회원탈퇴 성공', '그동안 감사했습니다🙋‍♀️', 'success', () => logout(true));
        navigate('/');
      } else {
        SwalAlert.alert('회원탈퇴 실패', '나갈 땐 마음대로 안 됩니다.', 'error');
      }
    } catch (error) {
      console.error('회원 탈퇴 처리 중 에러:', error);
      SwalAlert.alert('회원탈퇴 실패', '예기치 못한 오류가 발생했습니다.', 'error');
    }
  };

  if (!isLogin) {
    return null;
  }

  return (
    <div className="container">
      <Helmet>
        <title>Dorunning | 마이페이지</title>
        <meta name="description" content="나의 프로필 정보를 수정하고 활동 내역을 확인하세요. 안전하게 개인정보를 관리할 수 있습니다." />
        <meta property="og:title" content="Dorunning | 마이페이지" />
      </Helmet>
      <UserForm
        userInfo={userInfo}
        updateUser={updateUser}
        deleteUser={deleteUser}
        loginType={userInfo?.loginType}
      />
    </div>
  );
};

export default User;
