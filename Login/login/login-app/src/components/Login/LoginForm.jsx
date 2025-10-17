import React, { useContext, useState } from 'react'
import '../../assets/css/login.css';
import { LoginContext } from '../../contexts/LoginContextProvider'

const LoginForm = () => {

  // 📦 LoginContext - 🌞 Login 함수
  const { login } = useContext(LoginContext)

  // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // 로그인 처리 함수
  const onLogin = async (e) => {
    e.preventDefault()
    const form = e.target
    const username = form.username.value
    const password = form.password.value

    // 로그인 시작 시 로딩 상태 true로 설정
    setLoading(true)

    try {
      await login(username, password) // 로그인 시도
    } catch (err) {
      console.error(err)
      // 에러 처리 등 필요하면 추가
    } finally {
      // 로그인 후 로딩 상태 false로 설정
      setLoading(false)
    }
  }

  // Caps Lock 체크
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  return (
    <div className="form">
      <h2 className="login-title">로그인</h2>
      <form className='login-form' onSubmit={onLogin}>
        {/* username */}
        <div>
          <label htmlFor="username">ID</label>
          <input type="text"
                 id="username"
                 placeholder='ID'
                 name='username'
                 autoComplete='username'
                 required
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
                 disabled={loading} // 로딩 중 입력 불가
          />
        </div>

        {/* password */}
        <div>
          <label htmlFor="password">password</label>
          <input type="password"
                 id="password"
                 placeholder='password'
                 name='password'
                 autoComplete='password'
                 required
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
                 disabled={loading} // 로딩 중 입력 불가
          />
        </div>

        {/* 로그인 버튼 */}
        <button type='submit' className='btn btn--form btn-login' disabled={loading}>
          {loading ? '로그인중입니다...' : '로그인'}
        </button>

        {/* CapsLock 안내 */}
        <div className="capslock-warning" style={{ display: capsLockOn ? 'block' : 'none' }}>
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  )
}

export default LoginForm
