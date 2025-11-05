import React, { useState, useEffect } from 'react';
import '../../assets/css/join.css';
import { checkUsername } from '../../apis/auth';
import * as Swal from '../../apis/alert';

const JoinForm = ({ join }) => {
  // 상태 관리
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // 모바일 기기 여부 확인
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice =
      /android/i.test(userAgent) ||
      /iPad|iPhone|iPod/.test(userAgent) ||
      /windows phone/i.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  // 비밀번호 일치 여부 확인
  useEffect(() => {
    setPasswordMatch(password === passwordConfirm);
  }, [password, passwordConfirm]);

  // CapsLock 상태 확인
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(isOn);
  };

  // 아이디 중복 확인
  const handleCheckUsername = async () => {
    if (!username) {
      Swal.alert('아이디 입력 필요', '아이디를 먼저 입력해주세요.', 'info');
      return;
    }
    try {
      const res = await checkUsername(username);
      if (res.data.exists) {
        Swal.alert('중복된 아이디입니다.', '다른 아이디를 입력해주세요.', 'warning');
        setIsAvailable(false);
      } else {
        Swal.alert('사용 가능한 아이디입니다!', '', 'success');
        setIsAvailable(true);
      }
    } catch (err) {
      Swal.alert('확인 실패', '서버 오류가 발생했습니다.', 'error');
    }
  };

  // 회원가입 요청
  const onJoin = async (e) => {
    e.preventDefault();

    if (isMobile) {
      alert('회원가입은 PC 화면에서 이용해 주세요.');
      return;
    }

    if (!passwordMatch) {
      Swal.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    if (isAvailable !== true) {
      Swal.alert('아이디 중복 확인 필요', '아이디 중복 확인을 먼저 해주세요.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await join({ username, password, name, email });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 모바일 기기일 경우 안내 메시지
  if (isMobile) {
    return (
      <div className="form">
        <h2 className="login-title">회원가입</h2>
        <p style={{ color: 'red', textAlign: 'center' }}>
          ⚠️ 회원가입은 PC 화면에서만 가능합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="form">
      <h2 className="login-title">회원가입</h2>
      <form className="login-form" onSubmit={onJoin}>
        {/* 아이디 */}
        <div>
          <label htmlFor="username">ID</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="ID"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={checkCapsLock}
              onKeyDown={checkCapsLock}
            />
            <button type="button" onClick={handleCheckUsername} className="btn btn--form btn-check">
              중복 확인
            </button>
          </div>
          {isAvailable === false && (
            <p style={{ fontSize: '12px', color: 'red' }}>이미 사용 중인 아이디입니다.</p>
          )}
          {isAvailable === true && (
            <p style={{ fontSize: '12px', color: 'green' }}>사용 가능한 아이디입니다.</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            placeholder="비밀번호 확인"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
          {password && passwordConfirm && (
            <p style={{ fontSize: '12px', color: passwordMatch ? 'green' : 'red' }}>
              {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        {/* 이름 */}
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* 이메일 */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        {/* 가입 버튼 */}
        <button
          type="submit"
          className="btn btn--form btn-login"
          disabled={loading || !passwordMatch || isAvailable !== true}
        >
          {loading ? '가입중입니다...' : '가입하기'}
        </button>

        {/* CapsLock 경고 */}
        <div
          className="capslock-warning"
          style={{ display: capsLockOn ? 'block' : 'none' }}
        >
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  );
};

export default JoinForm;