import React from 'react';
import '../../../assets/css/profile.css'

const ProfileCard = ({ user }) => {
  return (
    <div className="profile-card">
      <img
        src={user.avatar_url || '/default-avatar.png'}
        alt="프로필 이미지"
        className="profile-avatar"
      />
      <h2 className="profile-username">{user.username}</h2>
      <p className="profile-bio">{user.bio || '자기소개가 없습니다.'}</p>
      <p className="profile-date">가입일: {new Date(user.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export default ProfileCard;