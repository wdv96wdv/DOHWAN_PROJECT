import React, { useContext, useState } from 'react'
import '../../assets/css/login.css';
import { LoginContext } from '../../contexts/LoginContextProvider'

const LoginForm = () => {

  // 📦 LoginContext - 🌞 Login 함수
  const { login } = useContext(LoginContext)

  // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)

  const onLogin = (e) => {
    e.preventDefault()
    const form = e.target
    const username = form.username.value
    const password = form.password.value

    login(username, password)
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
          />
        </div>

        <button type='submit' className='btn btn--form btn-login'>
          로그인
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
