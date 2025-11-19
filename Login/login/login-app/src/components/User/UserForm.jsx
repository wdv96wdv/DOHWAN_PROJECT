import '../../assets/css/user.css';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
const UserForm = ({ userInfo, updateUser, deleteUser, loginType }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    avatar_url: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  const [preview, setPreview] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);

  // 미리보기 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // userInfo가 바뀔 때 form 상태 초기화
  useEffect(() => {
    if (userInfo) {
      setForm({
        username: userInfo.username || '',
        name: userInfo.name || '',
        email: userInfo.email || '',
        avatar_url: userInfo.avatar_url || '',
        bio: userInfo.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (userInfo.avatar_url) {
        setPreview(userInfo.avatar_url);
      }
    }
  }, [userInfo]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(isOn);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();

    const formEl = e.target;
    // Conditionally get password fields only if loginType is traditional
    const currentPassword = loginType === "traditional" ? formEl.currentPassword?.value : '';
    const newPassword = loginType === "traditional" ? formEl.newPassword?.value : '';
    const confirmPassword = loginType === "traditional" ? formEl.confirmPassword?.value : '';
    const avatarFile = formEl.avatar.files[0];

    // 비밀번호 변경 조건 확인
    let passwordPayload = {};
    if (newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire('비밀번호 변경 실패', '모든 비밀번호 입력란을 채워주세요.', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        Swal.fire('비밀번호 변경 실패', '새 비밀번호가 일치하지 않습니다.', 'error');
        return;
      }

      passwordPayload = {
        currentPassword,
        newPassword,
        confirmPassword,
      };
    }


    // 프로필 이미지 업로드
    let avatar_url = form.avatar_url;
    if (avatarFile) {
      // 파일 검증: 이미지 타입 및 크기(최대 5MB)
      const isImage = avatarFile.type?.startsWith('image/');
      const isUnder5MB = avatarFile.size <= 5 * 1024 * 1024;
      if (!isImage) {
        Swal.fire('업로드 실패', '이미지 파일만 업로드할 수 있습니다.', 'error');
        return;
      }
      if (!isUnder5MB) {
        Swal.fire('업로드 실패', '이미지 크기는 5MB 이하여야 합니다.', 'error');
        return;
      }
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${form.username}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('이미지 업로드 실패:', error);
      } else {
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        if (publicData?.publicUrl) {
          const version = Date.now();
          avatar_url = `${publicData.publicUrl}?v=${version}`;
        } else {
          avatar_url = form.avatar_url;
        }
        setForm((prev) => ({ ...prev, avatar_url }));
      }
    }

    // 모든 정보 통합해서 한 번에 요청
    await updateUser({
      username: form.username,
      name: form.name,
      email: form.email,
      avatar_url,
      bio: form.bio,
      ...passwordPayload, // 비밀번호 관련 필드 포함 (있을 경우만)
    });
  };


  return (
    <div className="form">
      <h2 className="login-title">회원 정보</h2>
      <form className="login-form" onSubmit={onUpdate}>
        {/* 안내 메세지 */}
        {loginType === "traditional" && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            회원정보를 수정하려면 <strong>현재 비밀번호</strong>를 입력해주세요.<br />
            비밀번호를 변경하려면 <strong>새 비밀번호</strong>와 <strong>확인</strong>까지 입력해주세요.
          </p>
        )}
        {/* 비밀번호 변경 섹션 */}
        {loginType === "traditional" && (
          <>
            <h3>비밀번호 변경</h3>
            <div>
              <label htmlFor="currentPassword">현재 비밀번호</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                placeholder="현재 비밀번호"
                autoComplete="current-password"
                value={form.currentPassword}
                required={!!(form.newPassword || form.confirmPassword)}
                onChange={handleChange}
                onKeyUp={checkCapsLock}
                onKeyDown={checkCapsLock}
              />
            </div>
            <div>
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="새 비밀번호"
                autoComplete="new-password"
                value={form.newPassword}
                onKeyUp={checkCapsLock}
                onKeyDown={checkCapsLock}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="새 비밀번호 확인"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                onKeyUp={checkCapsLock}
                onKeyDown={checkCapsLock}
              />
            </div>
          </>
        )}

        {/* 이름 */}
        <div>
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength="10"
            required
          />
        </div>

        {/* 이메일 */}
        <div>
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            maxLength="40"
            required
          />
        </div>

        {/* 프로필 이미지 */}
        <div>
          <label htmlFor="avatar">프로필 이미지</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        {preview && (
          <img
            src={preview}
            alt="미리보기"
            style={{ width: '100px', borderRadius: '50%', marginTop: '1rem' }}
          />
        )}

        {/* 자기소개 */}
        <div>
          <label htmlFor="bio">자기소개</label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            value={form.bio}
            onChange={handleChange}
            placeholder="자기소개를 입력하세요"
            style={{ resize: 'none' }}
            maxLength="300" // maxLength를 300으로 변경
          />
          <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
            {form.bio.length} / 300
          </div>
        </div>

        {/* 찜 목록 페이지로 이동하는 링크 추가 */}
        <div className="center-wrapper">
          <Link to="/wishlist" className="btn btn--form btn-login">
            찜 목록 보러가기
          </Link>
        </div>


        {/* 수정 버튼 */}
        <button type="submit" className="btn btn--form btn-login">
          정보 수정
        </button>

        {/* 탈퇴 버튼 */}
        <button
          type="button"
          className="btn btn--form btn-login"
          onClick={() => {
            Swal.fire({
              title: '회원 탈퇴',
              text: '정말 회원 탈퇴를 진행하시겠습니까?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: '탈퇴',
              cancelButtonText: '취소',
            }).then((result) => {
              if (result.isConfirmed) {
                // 실제 처리/알림/네비는 부모(deleteUser)에서 일원화 해야함 
                deleteUser(form.username);

              }
            });
          }}
        >
          회원 탈퇴
        </button>

        {/* Caps Lock 경고 */}
        <div
          className="capslock-warning"
          style={{ display: capsLockOn ? 'block' : 'none' }}
        >
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  );
};

export default UserForm;