import React from 'react'
import JoinForm from '../../components/Join/JoinForm'
import { useNavigate } from 'react-router-dom'
import * as auth from '../../apis/auth'
import * as Swal from '../../apis/alert'
import { Helmet } from 'react-helmet-async'

const Join = () => {

  const navigate = useNavigate()

  // 회원 가입 요청
  const join = async (form) => {
    let response
    let data
    try {
      response = await auth.join(form)
    } catch (error) {
      console.error(`회원가입 중 에러가 발생하였습니다`);
      return
    }

    data = response.data
    const status = response.status
    if( status == 200 ) {
      Swal.alert(
        `회원 가입 성공`, `로그인 화면으로 이동합니다`, `success`,
        () => { navigate('/login') }
      )
    }
    else {
      Swal.alert(`회원가입 실패`, `회원가입에 실패했습니다.`, 'error')
    }
    
  }

  return (
    <>
      <Helmet>
        <title>Dorunning | 회원가입</title>
        <meta name="description" content="Dorunning 크루의 일원이 되어 나만의 러닝 여정을 시작하세요. 회원가입 후 다양한 서비스를 이용할 수 있습니다." />
        <meta property="og:title" content="Dorunning | 회원가입" />
      </Helmet>
      <div className="auth-page">
        <JoinForm join={ join } />
      </div>
    </>
  )
}

export default Join