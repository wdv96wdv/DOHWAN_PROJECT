import '../../assets/css/user.css';
import '../../assets/css/auth.css'; // Reuse form-control etc.
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import { Camera, Shield, User, Mail, FileText, Trash2, Heart } from 'lucide-react';

const UserForm = ({ userInfo, updateUser, deleteUser, loginType }) => {
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

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
      if (userInfo.avatar_url) setPreview(userInfo.avatar_url);
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
        Swal.fire('Error', 'Only images allowed', 'error');
        return;
      }
      if (!isUnder5MB) {
        Swal.fire('Error', 'Max 5MB', 'error');
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    const formEl = e.target;
    const currentPassword = loginType === "traditional" ? form.currentPassword : '';
    const newPassword = loginType === "traditional" ? form.newPassword : '';
    const confirmPassword = loginType === "traditional" ? form.confirmPassword : '';
    const avatarFile = formEl.avatar.files[0];

    let passwordPayload = {};
    if (newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire('Error', 'Please fill all password fields', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        Swal.fire('Error', 'Passwords do not match', 'error');
        return;
      }
      passwordPayload = { currentPassword, newPassword, confirmPassword };
    }

    let avatar_url = form.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${form.username}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (error) {
        console.error('Upload failed:', error);
      } else {
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = `${publicData.publicUrl}?v=${Date.now()}`;
      }
    }

    await updateUser({
      ...form,
      avatar_url,
      ...passwordPayload
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Sidebar Profile Card */}
        <aside className="profile-card">
          <div className="avatar-wrapper">
            <img 
              src={preview || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="avatar-preview" 
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
            <p className="text-muted">{form.username}</p>
          </div>
          <Link to="/wishlist" className="btn-auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Heart size={18} /> MY WISHLIST
          </Link>
          <button 
            type="button" 
            className="btn-outline btn-delete" 
            onClick={() => {
              Swal.fire({
                title: 'Delete Account?',
                text: 'This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f44336',
                confirmButtonText: 'Delete'
              }).then(res => res.isConfirmed && deleteUser(form.username));
            }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Trash2 size={18} /> DELETE ACCOUNT
          </button>
        </aside>

        {/* Form Content */}
        <main className="profile-form-section">
          <form className="profile-form" onSubmit={onUpdate}>
            <section>
              <h3><User size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/> BASIC INFO</h3>
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
                  placeholder="Tell us about yourself"
                  style={{ resize: 'none' }}
                />
              </div>
            </section>

            {loginType === "traditional" && (
              <section style={{marginTop: '32px'}}>
                <h3><Shield size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/> SECURITY</h3>
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