import '../../assets/css/user.css';
import React, { useState } from 'react'
import Swal from 'sweetalert2';

const UserForm = ({ userInfo, updateUser, deleteUser }) => {

   // Caps Lock 상태
  const [capsLockOn, setCapsLockOn] = useState(false)

  // 정보 수정
  const onUpdate = (e) => {
    e.preventDefault()

    const form = e.target
    const username = form.username.value
    const password = form.password.value
    const name = form.name.value
    const email = form.email.value
    console.log(username, password, name, email);

    updateUser({ username, password, name, email })

  }
  // Caps Lock 체크 (KeyDown, KeyUp 둘 다 사용)
  const checkCapsLock = (e) => {
    const isOn = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(isOn)
  }

  return (
    <div className="form">
      <h2 className="login-title">회원 정보</h2>
      <form className='login-form' onSubmit={(e) => onUpdate(e)}>
        <div>
          <label htmlFor="username">username</label>
          <input type="text"
            id='username'
            placeholder='username'
            name='username'
            autoComplete='username'
            required
            readOnly
            defaultValue={userInfo?.username}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        <div>
          <label htmlFor="password">password</label>
          <input type="password"
            id='password'
            placeholder='password'
            name='password'
            autoComplete='password'
            required
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        <div>
          <label htmlFor="name">name</label>
          <input type="text"
            id='name'
            placeholder='name'
            name='name'
            autoComplete='name'
            required
            defaultValue={userInfo?.name}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        <div>
          <label htmlFor="email">email</label>
          <input type="text"
            id='email'
            placeholder='email'
            name='email'
            autoComplete='email'
            required
            defaultValue={userInfo?.email}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
          />
        </div>

        <button type='submit' className='btn btn--form btn-login'>
          정보 수정
        </button>
        <button
          type="button"
          className='btn btn--form btn-login'
          onClick={() => {
            Swal.fire({
              title: '회원 탈퇴',
              text: '정말 회원 탈퇴를 진행하시겠습니까?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: '탈퇴',
              cancelButtonText: '취소'
            }).then((result) => {
              if (result.isConfirmed) {
                deleteUser(userInfo.username);
                Swal.fire('완료!', '회원 탈퇴가 완료되었습니다.', 'success');
              }
            })
          }}
        > 회원 탈퇴
        </button>
        {/* CapsLock 안내 */}
        <div className="capslock-warning" style={{ display: capsLockOn ? 'block' : 'none' }}>
          ⚠️ Caps Lock이 켜져 있습니다.
        </div>
      </form>
    </div>
  )
}

export default UserForm