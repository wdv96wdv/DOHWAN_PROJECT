import React from 'react'
import '../../assets/css/join.css';

const JoinForm = ({ join }) => {

  // 가입하기 클릭 이벤트
  const onJoin = (e) => {
    e.preventDefault()      // submit 기본 동작 방비
    const form = e.target
    const username = form.username.value
    const password = form.password.value
    const name = form.name.value
    const email = form.email.value
    console.log(username, password, name, email);

    join( { username, password, name, email } )
  }

  return (
    <div className="form">
      <h2 className="login-title">회원가입</h2>
      <form className='login-form' onSubmit={ (e) => onJoin(e) }>
        {/* username */}
        <div>
          <label htmlFor="username">ID</label>
          <input type="text" 
                 id="username"
                 placeholder='ID'
                 name='username'
                 autoComplete='username'
                 required
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
           />
        </div>

        <button type='submit' className='btn btn--form btn-login'>
          가입하기
        </button>


      </form>
    </div>
  )
}

export default JoinForm