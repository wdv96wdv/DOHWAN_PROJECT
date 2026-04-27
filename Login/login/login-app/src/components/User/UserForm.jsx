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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type?.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      if (!isImage) {
        Swal.fire('Error', '이미지 파일만 업로드 가능합니다.', 'error');
        return;
      }
      if (!isUnder5MB) {
        Swal.fire('Error', '파일 크기는 최대 5MB까지 가능합니다.', 'error');
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();

    const avatarInput = document.getElementById('avatar');
    const avatarFile = avatarInput?.files?.[0];

    const currentPassword = loginType === "traditional" ? form.currentPassword : '';
    const newPassword = loginType === "traditional" ? form.newPassword : '';
    const confirmPassword = loginType === "traditional" ? form.confirmPassword : '';

    let passwordPayload = {};
    if (newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire('오류', '비밀번호 변경을 위해 모든 필드를 입력해주세요.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        Swal.fire('오류', '새 비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      passwordPayload = { currentPassword, newPassword, confirmPassword };
    }

    let avatarUrl = form.avatarUrl;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${form.username}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (error) {
        console.error('Upload failed:', error);
        Swal.fire('업로드 오류', '이미지 서버 업로드에 실패했습니다.', 'error');
        return; // 업로드 실패 시 중단
      } else {
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicData.publicUrl;
      }
    }

    const finalUpdateData = {
      ...form,
      avatarUrl,
      ...passwordPayload
    };

    try {
      // 1. 부모 컴포넌트의 updateUser 호출
      await updateUser(finalUpdateData);

      // 2. 스토어 정보 갱신
      await updateUserInfo();

    } catch (err) {
      console.error(err);
      Swal.fire('오류', '정보 업데이트 중 오류가 발생했습니다.', 'error');
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
            <Trash2 size={18} /> DELETE ACCOUNT
          </button>
        </aside>

        <main className="profile-form-section">
          <form className="profile-form" onSubmit={onUpdate}>
            <section>
              <h3><User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> BASIC INFO</h3>
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
              <button type="submit" className="btn-auth btn-update">SAVE CHANGES</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UserForm;