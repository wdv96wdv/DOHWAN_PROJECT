import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/User/UserForm';
import useAuthStore from '../../store/useAuthStore';
import * as auth from '../../apis/auth';
import * as Swal from '../../apis/alert';
import supabase from '../../utils/supabaseClient';

const User = () => {
  const isLoading = useAuthStore(state => state.isLoading);
  const isLogin = useAuthStore(state => state.isLogin);
  const roles = useAuthStore(state => state.roles);
  const logout = useAuthStore(state => state.logout);
  const userInfo = useAuthStore(state => state.userInfo);
  const updateUserInfo = useAuthStore(state => state.updateUserInfo);
  const navigate = useNavigate();
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
        Swal.alert('회원정보 수정 실패', '회원 정보 수정에 실패했습니다.', 'error');
        return;
      }

      if (isPasswordChange) {
        Swal.alert('회원정보 수정 성공', '비밀번호가 변경되어 로그아웃 후 다시 로그인해주세요.', 'success', () => logout(true));
      } else {
        // 전역 상태 갱신 (헤더 아바타 등 즉시 반영)
        await updateUserInfo();
        Swal.alert('회원정보 수정 성공', '정보가 정상적으로 수정되었습니다.', 'success');
        navigate('/');
      }

    } catch (error) {
      console.error('회원정보 수정 중 에러:', error);
      Swal.alert('회원정보 수정 실패', '예기치 못한 오류가 발생했습니다.', 'error');
    }
  };

  // 회원 탈퇴
  const deleteUser = async (username) => {
    try {
      const response = await auth.remove(username);
      if (response?.status === 200) {
        Swal.alert('회원탈퇴 성공', '그동안 감사했습니다🙋‍♀️', 'success', () => logout(true));
        navigate('/');
      } else {
        Swal.alert('회원탈퇴 실패', '나갈 땐 마음대로 안 됩니다.', 'error');
      }
    } catch (error) {
      console.error('회원 탈퇴 처리 중 에러:', error);
      Swal.alert('회원탈퇴 실패', '예기치 못한 오류가 발생했습니다.', 'error');
    }
  };

  // 로그인 체크
  useEffect(() => {
    if (isLoading) return;
    if (!isLogin || !roles?.isUser) {
      navigate('/login');
    }
  }, [isLoading, isLogin, roles, navigate]);

  return (
    <div className="container">
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