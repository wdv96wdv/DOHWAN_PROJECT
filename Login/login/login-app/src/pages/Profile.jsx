import supabase from '../utils/supabaseClient';
import React, { useEffect, useState } from 'react';
import ProfileCard from '../components/User/Profile/ProfileCard';

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error) setUserData(data);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="profile-page">
      <h1>내 프로필</h1>
      {userData ? <ProfileCard user={userData} /> : <p>로딩 중...</p>}
    </div>
  );
};

export default Profile;