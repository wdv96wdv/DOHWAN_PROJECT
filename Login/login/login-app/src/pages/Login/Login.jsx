import React from 'react'
import LoginForm from '../../components/Login/LoginForm'
import { Helmet } from 'react-helmet-async'

const Login = () => {

  return (
    <>
      <Helmet>
        <title>Dorunning | 로그인</title>
        <meta name="description" content="Dorunning에 로그인하여 나만의 러닝 기록과 마라톤 일정을 관리하세요." />
        <meta property="og:title" content="Dorunning | 로그인" />
      </Helmet>
      <div className="auth-page">
        <LoginForm />
      </div>
    </>
  )
}

export default Login