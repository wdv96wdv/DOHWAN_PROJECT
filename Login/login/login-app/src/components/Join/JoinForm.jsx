import React, { useState, useEffect } from 'react'
import '../../assets/css/join.css';

const JoinForm = ({ join }) => {

  // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)
  // 로딩 상태
  const [loading, setLoading] = useState(false)
  // 모바일 여부 상태
  const [isMobile, setIsMobile] = useState(false)
  // 비밀번호와 비밀번호 확인 상태
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordMatch, setPasswordMatch] = useState(true)

  // 화면 크기 체크
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 비밀번호와 비밀번호 확인 일치 여부를 실시간으로 체크
  useEffect(() => {
    if (password && passwordConfirm) {
      setPasswordMatch(password === passwordConfirm)
    }
  }, [password, passwordConfirm])

  // 가입하기 클릭 이벤트
  const onJoin = async (e) => {
    e.preventDefault()

    // 모바일일 때 가입 제한
    if (isMobile) {
      alert('회원가입은 PC 화면에서 이용해 주세요.')
      return
    }

    const form = e.target
    const username = form.username.value
    const name = form.name.value
    const email = form.email.value

    // 로딩 시작
    setLoading(true)

    try {
      await join({ username, password, name, email })
      // 성공 시 알림 등 처리 가능
    } catch (err) {
      console.error(err)
      // 에러 처리 가능
    } finally {
      // 로딩 종료
      setLoading(false)
    }
  }

  // Caps Lock 체크 (KeyDown, KeyUp 둘 다 사용)
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  // 모바일 화면일 때 경고 표시
  if (isMobile) {
    return (
      <div className="form">
        <h2 className="login-title">회원가입</h2>
        <p style={{ color: 'red', textAlign: 'center' }}>
          ⚠️ 회원가입은 PC 화면에서만 가능합니다.
        </p>
      </div>
    )
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
                 value={password}
                 onChange={(e) => setPassword(e.target.value)} // 비밀번호 상태 업데이트
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
          />
        </div>

        {/* password confirm */}
        <div>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input type="password"
                 id="passwordConfirm"
                 placeholder='비밀번호 확인'
                 name='passwordConfirm'
                 autoComplete='new-password'
                 required
                 value={passwordConfirm}
                 onChange={(e) => setPasswordConfirm(e.target.value)} // 비밀번호 확인 상태 업데이트
                 onKeyUp={checkCapsLock}
                 onKeyDown={checkCapsLock}
          />
          {/* 실시간 비밀번호 불일치 경고 */}
          {password && passwordConfirm && (
            <p 
              style={{
                fontSize: '12px',
                color: passwordMatch ? 'green' : 'red',
              }}
            >
              {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
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

        {/* 가입 버튼 */}
        <button type='submit' className='btn btn--form btn-login' disabled={loading || !passwordMatch}>
          {loading ? '가입중입니다...' : '가입하기'}
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
