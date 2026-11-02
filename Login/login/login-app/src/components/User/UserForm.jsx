import '../../assets/css/user.css';
import '../../assets/css/auth.css';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import supabase from '../../utils/supabaseClient';
import { Camera, Shield, User, Trash2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import noImage from '../../assets/img/no-image.png';
import useAuthStore from '../../store/useAuthStore';

const UserForm = ({ userInfo = {}, updateUser, deleteUser, loginType }) => {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    avatarUrl: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preview, setPreview] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);


  // 아바타를 webp로 변환 (최대 512px). 가입/포스터와 같은 방식
  const toWebp = async (file, maxSize = 512, quality = 0.85) => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    if (!blob || blob.type !== 'image/webp') throw new Error('이미지 변환에 실패했습니다.');
    return blob;
  };

  // ✅ 스토어에서 이미 만들어진 updateUserInfo 함수를 가져옵니다.
  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      setForm({
        username: userInfo.username || '',
        name: userInfo.name || '',
        email: userInfo.email || '',
        avatarUrl: userInfo.avatarUrl || '',
        bio: userInfo.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      if (userInfo.avatarUrl) {
        setPreview(userInfo.avatarUrl);
      } else {
        setPreview('');
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

  const handleRemoveAvatar = () => {
    setAvatarFile(null);        // 선택해 둔 새 파일도 취소
    setPreview('');             // noImage로 표시됨
    setAvatarRemoved(true);
  };



  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 잘못된 파일이 input에 남지 않게 + 같은 파일 재선택 가능
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      Swal.fire('Error', '이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', '파일 크기는 최대 5MB까지 가능합니다.', 'error');
      return;
    }
    setAvatarFile(file);
    setAvatarRemoved(false);
    setPreview(URL.createObjectURL(file));
  };


  const onUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;

    const email = form.email.trim().toLowerCase();
    const name = form.name.trim();

    const isTraditional = loginType === 'traditional';
    const { currentPassword, newPassword, confirmPassword } = isTraditional
      ? form
      : { currentPassword: '', newPassword: '', confirmPassword: '' };

    let passwordPayload = {};
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return Swal.fire('오류', '비밀번호 변경을 위해 모든 필드를 입력해주세요.', 'error');
      }
      if (newPassword.length < 8) {
        return Swal.fire('오류', '새 비밀번호는 8자 이상이어야 합니다.', 'warning');
      }
      if (newPassword !== confirmPassword) {
        return Swal.fire('오류', '새 비밀번호가 일치하지 않습니다.', 'error');
      }
      if (newPassword === currentPassword) {
        return Swal.fire('오류', '현재 비밀번호와 다른 비밀번호를 입력해주세요.', 'warning');
      }
      passwordPayload = { currentPassword, newPassword, confirmPassword };
    }

    setLoading(true);
    try {
      let avatarUrl = form.avatarUrl;
      if (avatarRemoved && !avatarFile) avatarUrl = '';

      if (avatarFile) {
        let blob;
        try {
          blob = await toWebp(avatarFile);
        } catch (convErr) {
          console.error(convErr);
          return Swal.fire('이미지 오류', '이 이미지는 사용할 수 없어요. JPG, PNG, WEBP 파일로 다시 시도해주세요.', 'error');
        }
        const fileName = `${form.username}_${Date.now()}.webp`;
        const { error } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: false, // 매번 새 파일명이라 upsert 불필요 (INSERT 권한만 필요)
          });
        if (error) {
          console.error('Upload failed:', error);
          return Swal.fire('업로드 오류', '이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        }
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      }

      const { currentPassword: _c, newPassword: _n, confirmPassword: _f, ...profile } = form;
      await updateUser({ ...profile, email, name, avatarUrl, ...passwordPayload });
      await updateUserInfo();

      setAvatarFile(null);
      setAvatarRemoved(false);
      setForm((prev) => ({ ...prev, email, name, avatarUrl, currentPassword: '', newPassword: '', confirmPassword: '' }));
      Swal.fire('완료', '정보가 수정되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 400 || status === 409) {
        Swal.fire('수정 실패', serverMsg || '이미 사용 중인 이메일이거나 입력값이 올바르지 않습니다.', 'warning');
      } else if (status === 401 || status === 403) {
        Swal.fire('권한 오류', serverMsg || '다시 로그인한 뒤 시도해주세요.', 'error');
      } else {
        Swal.fire('오류', '정보 업데이트 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        <aside className="profile-card">
          <div className="avatar-wrapper">
            <img
              src={preview || noImage}
              alt="Profile"
              className="avatar-preview"
              onError={(e) => { e.target.src = noImage; }}
            />
            <label htmlFor="avatar" className="avatar-upload-btn">
              <Camera size={20} />
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          {preview && (
            <button
              type="button"
              className="btn-outline"
              onClick={handleRemoveAvatar}
              style={{ width: '100%', marginTop: '10px' }}
            >
              프로필 사진 삭제
            </button>
          )}
          <div className="profile-info-brief">
            <h2 className="auth-title">{form.name || 'User'}</h2>
            <p className="text-muted">{form.email}</p>
          </div>
          <Link to="/wishlist" className="btn-auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Heart size={18} /> MY WISHLIST
          </Link>
          <button
            type="button"
            className="btn-outline btn-delete"
            onClick={() => {
              Swal.fire({
                title: '계정을 삭제하시겠습니까?',
                text: '이 작업은 되돌릴 수 없습니다.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f44336',
                confirmButtonText: '삭제'
              }).then(res => res.isConfirmed && deleteUser(form.username));
            }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
          >
            <Trash2 size={18} /> 회원 탈퇴 하기
          </button>
        </aside>

        <main className="profile-form-section">
          <form className="profile-form" onSubmit={onUpdate}>
            <section>
              <h3><User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 기본 정보</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Biography</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows="4"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="자기소개를 해주세요"
                  style={{ resize: 'none' }}
                />
              </div>
            </section>

            {loginType === "traditional" && (
              <section style={{ marginTop: '32px' }}>
                <h3><Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> SECURITY</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={form.currentPassword}
                    onChange={handleChange}
                    onKeyUp={checkCapsLock}
                    onKeyDown={checkCapsLock}
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={form.newPassword}
                    onChange={handleChange}
                    onKeyUp={checkCapsLock}
                    onKeyDown={checkCapsLock}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onKeyUp={checkCapsLock}
                    onKeyDown={checkCapsLock}
                  />
                </div>
                {capsLockOn && <div className="capslock-warning">⚠️ Caps Lock is ON</div>}
              </section>
            )}

            <div className="profile-actions">
              <button type="submit" className="btn-auth btn-update" disabled={loading}>
                {loading ? '저장 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UserForm;