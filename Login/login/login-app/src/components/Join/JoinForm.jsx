import React, { useState, useEffect } from 'react';
import '../../assets/css/auth.css';
import { checkUsername } from '../../apis/auth';
import * as Swal from '../../apis/alert';
import { Link } from 'react-router-dom';

const JoinForm = ({ join }) => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    setPasswordMatch(password === passwordConfirm);
  }, [password, passwordConfirm]);

  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(isOn);
  };

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

  const onJoin = async (e) => {
    e.preventDefault();

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

  return (
    <div className="auth-card">
      <h2 className="auth-title">CREATE ACCOUNT</h2>
      <form className="auth-form" onSubmit={onJoin}>
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <div className="input-with-button">
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="아이디를 입력하세요"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={checkCapsLock}
              onKeyDown={checkCapsLock}
            />
            <button type="button" onClick={handleCheckUsername} className="btn-outline">
              중복 확인
            </button>
          </div>
          {isAvailable === false && <p className="validation-msg error">이미 사용 중인 아이디입니다.</p>}
          {isAvailable === true && <p className="validation-msg success">사용 가능한 아이디입니다!</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="8자 이상 입력하세요"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            className="form-control"
            placeholder="비밀번호를 다시 입력하세요"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
          {password && passwordConfirm && (
            <p className={`validation-msg ${passwordMatch ? 'success' : 'error'}`}>
              {passwordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="이름을 입력하세요"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일 주소</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="이메일 주소를 입력하세요"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {capsLockOn && (
          <div className="capslock-warning">
            <span>⚠️</span> Caps Lock이 켜져 있습니다
          </div>
        )}

        <button
          type="submit"
          className="btn-auth"
          disabled={loading || !passwordMatch || isAvailable !== true}
        >
          {loading ? '처리 중...' : '가입하기'}
        </button>

        <div className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </form>
    </div>
  );
};

export default JoinForm;