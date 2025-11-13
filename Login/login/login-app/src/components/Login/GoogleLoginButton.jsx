// src/components/Login/GoogleLoginButton.jsx
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useContext } from 'react';
import { LoginContext } from '../../contexts/LoginContextProvider';
import googleIcon from '../../assets/img/google-icon.svg';


const GoogleLoginButton = () => {
    const { loginWithSocial } = useContext(LoginContext);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const payload = {
                username: user.uid,
                name: user.displayName,
                email: user.email,
                avatar_url: user.photoURL
            };

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/social-login`, payload)
            const { token, userInfo } = response.data;

            loginWithSocial(token, userInfo); // ✅ LoginContext에 로그인 처리
            console.log('✅ 로그인 성공:', user);
        } catch (error) {
            console.error('❌ 로그인 실패:', error);
        }
    };

    return (
        <button className="google-login-btn" onClick={handleLogin}>
            <img src={googleIcon} alt="Google" />
            <span>Google로 로그인</span>
        </button>
    );
};

export default GoogleLoginButton;