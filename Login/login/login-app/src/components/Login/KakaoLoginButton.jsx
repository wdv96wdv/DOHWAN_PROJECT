import React from 'react';
import kakaoIcon from '../../assets/img/kakao_login_medium_wide.png';

const KakaoLoginButton = () => {
    const REST_API_KEY = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const handleLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <button 
            type="button" 
            onClick={handleLogin} 
            style={{ 
                padding: 0, 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <img 
                src={kakaoIcon} 
                alt="카카오 로그인" 
                style={{ width: '100%', maxWidth: '300px', borderRadius: '6px' }} 
            />
        </button>
    );
};

export default KakaoLoginButton;
