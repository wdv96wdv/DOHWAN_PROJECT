import React, { useState } from 'react'
import '../../assets/css/auth.css';
import useAuthStore from '../../store/useAuthStore'
import GoogleLoginButton from './GoogleLoginButton';
import KakaoLoginButton from './KakaoLoginButton';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [loading, setLoading] = useState(false)

  const onLogin = async (e) => {
    e.preventDefault()
    const form = e.target
    const username = form.username.value
    const password = form.password.value

    setLoading(true)
    try {
      await login(username, password, navigate)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">LOG IN</h2>
      <form className='auth-form' onSubmit={onLogin}>
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input type="text"
            id="username"
            className="form-control"
            placeholder='아이디를 입력하세요'
            name='username'
            autoComplete='username'
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input type="password"
            id="password"
            className="form-control"
            placeholder='비밀번호를 입력하세요'
            name='password'
            autoComplete='current-password'
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
            disabled={loading}
          />
        </div>

        {capsLockOn && (
          <div className="capslock-warning">
            <span>⚠️</span> Caps Lock이 켜져 있습니다
          </div>
        )}

        <button type='submit' className='btn-auth' disabled={loading}>
          {loading ? '처리 중...' : '로그인'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>또는</span>
          <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <GoogleLoginButton />
        <div style={{ height: '8px' }}></div>
        <KakaoLoginButton />

        <div className="auth-footer">
          계정이 없으신가요? <Link to="/join">회원가입</Link>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
