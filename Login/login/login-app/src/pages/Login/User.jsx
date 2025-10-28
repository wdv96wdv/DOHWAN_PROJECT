import React, { useContext, useEffect, useState } from 'react';
import UserForm from '../../components/User/UserForm';
import { LoginContext } from '../../contexts/LoginContextProvider';
import { useNavigate } from 'react-router-dom';
import * as auth from '../../apis/auth';
import * as Swal from '../../apis/alert';
import supabase from '../../utils/supabaseClient';

const User = () => {
  const { isLoading, isLogin, roles, logout, userInfo } = useContext(LoginContext);
  const navigate = useNavigate();
  const [profileInfo, setProfileInfo] = useState({});

  // 로그인 체크
  useEffect(() => {
    if (isLoading) return;
    if (!isLogin || !roles.isUser) {
      navigate('/login');
    }
  }, [isLoading]);

  // Supabase 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.no) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, bio')
        .eq('no', userInfo.no)
        .single();

      if (error) {
        console.error('프로필 정보 불러오기 실패:', error);
        setProfileInfo({});
      } else {
        setProfileInfo(data);
      }
    };

    fetchProfile();
  }, [userInfo]);

  // 회원 정보 수정
  const updateUser = async (form) => {
    const { username, name, email, avatar_url, bio, currentPassword,
      newPassword,
      confirmPassword
    } = form;

    try {
      const response = await auth.update({
        username, name, email, currentPassword,
        newPassword,
        confirmPassword
      });
      if (response.status !== 200) {
        Swal.alert('회원정보 수정 실패', '기본 정보 수정에 실패했습니다.', 'error');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url, bio })
        .eq('no', userInfo.no);

      if (error) {
        console.error('프로필 업데이트 실패:', error);
        Swal.alert('프로필 수정 실패', '프로필 정보 저장 중 오류가 발생했습니다.', 'error');
        return;
      }

      Swal.alert('회원정보 수정 성공', '로그아웃 후 다시 로그인해주세요.', 'success', () => logout(true));
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
      } else {
        Swal.alert('회원탈퇴 실패', '나갈 땐 마음대로 안 됩니다.', 'error');
      }
    } catch (error) {
      console.error('회원 탈퇴 처리 중 에러:', error);
      Swal.alert('회원탈퇴 실패', '예기치 못한 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="container">
      <UserForm
        userInfo={{ ...userInfo, ...profileInfo }}
        updateUser={updateUser}
        deleteUser={deleteUser}
      />
    </div>
  );
};

export default User;