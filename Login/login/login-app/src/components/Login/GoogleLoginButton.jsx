// src/components/Login/GoogleLoginButton.jsx
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Swal from 'sweetalert2';
import googleIcon from '../../assets/img/google-icon.svg';
import { useState } from 'react';


const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const loginWithSocial = useAuthStore(state => state.loginWithSocial);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // 1단계: Firebase Google 팝업 인증
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const payload = {
                username: user.uid,
                name: user.displayName,
                email: user.email,
                avatar_url: user.photoURL
            };

            // 2단계: 백엔드 소셜 로그인 처리
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/auth/social-login`,
                payload,
                { timeout: 15000 }
            );
            const { token, userInfo } = response.data.data;

            loginWithSocial(token, userInfo, navigate);
        } catch (error) {
            console.error('❌ Google 로그인 실패:', error);

            // Firebase 팝업 취소
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                // 사용자가 팝업을 닫은 경우 → 에러 표시 안 함
                setLoading(false);
                return;
            }

            // Firebase 도메인 미등록
            if (error.code === 'auth/unauthorized-domain') {
                Swal.fire({
                    icon: 'error',
                    title: 'Google 로그인 설정 오류',
                    text: '현재 도메인이 Firebase 승인 도메인에 등록되지 않았습니다. 관리자에게 문의해 주세요.',
                    confirmButtonColor: 'var(--primary)',
                });
                setLoading(false);
                return;
            }

            // Firebase 기타 인증 에러
            if (error.code && error.code.startsWith('auth/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Google 로그인 실패',
                    text: `인증 오류가 발생했습니다. (${error.code})`,
                    confirmButtonColor: 'var(--primary)',
                });
                setLoading(false);
                return;
            }

            // 백엔드 서버 에러 (Render 슬립 등)
            if (error.response) {
                Swal.fire({
                    icon: 'error',
                    title: 'Google 로그인 실패',
                    text: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                    confirmButtonColor: 'var(--primary)',
                });
            } else if (error.request) {
                Swal.fire({
                    icon: 'warning',
                    title: '서버 연결 실패',
                    text: '서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요. (서버 웜업 중일 수 있습니다)',
                    confirmButtonColor: 'var(--primary)',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Google 로그인 실패',
                    text: error.message || '알 수 없는 오류가 발생했습니다.',
                    confirmButtonColor: 'var(--primary)',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button type="button" className="btn-social-login google" onClick={handleLogin} disabled={loading}>
            {loading ? (
                <span style={{ fontSize: '0.9rem' }}>로그인 처리 중...</span>
            ) : (
                <>
                    <img src={googleIcon} alt="Google" />
                    <span>Google 로그인</span>
                </>
            )}
        </button>
    );
};

export default GoogleLoginButton;
