import React, { useState, useEffect } from 'react'
import '../../assets/css/join.css';

const JoinForm = ({ join }) => {
  // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)
  // 로딩 상태
  const [loading, setLoading] = useState(false)
  // 모바일 기기 여부
  const [isMobile, setIsMobile] = useState(false)
  // 비밀번호 관련 상태
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordMatch, setPasswordMatch] = useState(true)

  // ✅ 실제 모바일 기기 여부 체크 (화면 크기와 무관)
  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice =
        /android/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent) ||
        /windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobileDevice();
  }, []);

  // 비밀번호 일치 여부 실시간 확인
  useEffect(() => {
    if (password && passwordConfirm) {
      setPasswordMatch(password === passwordConfirm)
    }
  }, [password, passwordConfirm])

  // CapsLock 체크
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  // 회원가입 클릭
  const onJoin = async (e) => {
    e.preventDefault()

    if (isMobile) {
      alert('회원가입은 PC 화면에서 이용해 주세요.')
      return
    }

    const form = e.target
    const username = form.username.value
    const name = form.name.value
    const email = form.email.value

    setLoading(true)
    try {
      await join({ username, password, name, email })
      // 성공 시 알림, 이동 등 추가 가능
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 실제 모바일 기기라면 경고 화면만 표시
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
          <input
            type="text"
            id="username"
            placeholder="ID"
            name="username"
            autoComplete="username"
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* password */}
        <div>
          <label htmlFor="password">password</label>
          <input
            type="password"
            id="password"
            placeholder="password"
            name="password"
            autoComplete="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* password confirm */}
        <div>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            placeholder="비밀번호 확인"
            name="passwordConfirm"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
          {password && passwordConfirm && (
            <p
              style={{
                fontSize: '12px',
                color: passwordMatch ? 'green' : 'red',
              }}
            >
              {passwordMatch
                ? '비밀번호가 일치합니다.'
                : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        {/* name */}
        <div>
          <label htmlFor="name">name</label>
          <input
            type="text"
            id="name"
            placeholder="name"
            name="name"
            autoComplete="name"
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* email */}
        <div>
          <label htmlFor="email">email</label>
          <input
            type="email"
            id="email"
            placeholder="email"
            name="email"
            autoComplete="email"
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* 가입 버튼 */}
        <button
          type="submit"
          className="btn btn--form btn-login"
          disabled={loading || !passwordMatch}
        >
          {loading ? '가입중입니다...' : '가입하기'}
        </button>

        {/* CapsLock 안내 */}
        <div
          className="capslock-warning"
          style={{ display: capsLockOn ? 'block' : 'none' }}
        >
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  )
}

export default JoinForm
