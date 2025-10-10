import React, { useState } from 'react'
import '../../assets/css/join.css';

const JoinForm = ({ join }) => {

  // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)

  // 가입하기 클릭 이벤트
  const onJoin = (e) => {
    e.preventDefault()
    const form = e.target
    const username = form.username.value
    const password = form.password.value
    const name = form.name.value
    const email = form.email.value
    console.log(username, password, name, email);

    join({ username, password, name, email })
  }

  // Caps Lock 체크 (KeyDown, KeyUp 둘 다 사용)
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  return (
    <div className="form">
      <h2 className="login-title">회원가입</h2>
      <form className='login-form' onSubmit={onJoin}>
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

        {/* name */}
        <div>
          <label htmlFor="name">name</label>
          <input type="text"
                 id="name"
                 placeholder='name'
                 name='name'
                 autoComplete='name'
                 required
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
          />
        </div>

        {/* email */}
        <div>
          <label htmlFor="email">email</label>
          <input type="email"
                 id="email"
                 placeholder='email'
                 name='email'
                 autoComplete='email'
                 required
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
          />
        </div>

        <button type='submit' className='btn btn--form btn-login'>
          가입하기
        </button>

        {/* CapsLock 안내 */}
        <div className="capslock-warning" style={{ display: capsLockOn ? 'block' : 'none' }}>
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  )
}

export default JoinForm
