import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/Common/Loading';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const loginWithSocial = useAuthStore(state => state.loginWithSocial);

    const hasCalled = React.useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code && !hasCalled.current) {
            hasCalled.current = true;
            handleKakaoLogin(code);
        } else if (!code) {
            console.error('❌ 카카오 인증 코드가 없습니다.');
            navigate('/login');
        }
    }, [location]);

    const handleKakaoLogin = async (code) => {
        try {
            // 백엔드에 인가 코드를 전달하여 로그인 처리
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/kakao-login`, { code });
            const { token, userInfo } = response.data.data;

            // 전역 상태에 로그인 정보 저장
            loginWithSocial(token, userInfo, navigate);
        } catch (error) {
            console.error('❌ 카카오 로그인 실패:', error);
            navigate('/login');
        }
    };

    return <Loading text="카카오 로그인 처리 중..." />;
};

export default KakaoCallback;
