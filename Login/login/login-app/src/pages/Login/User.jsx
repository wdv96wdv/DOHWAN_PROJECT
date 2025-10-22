import React, { useContext, useEffect } from 'react'
import UserForm from '../../components/User/UserForm'
import { LoginContext } from '../../contexts/LoginContextProvider'
import { useNavigate } from 'react-router-dom'
import * as auth from '../../apis/auth'
import * as Swal from '../../apis/alert'

const User = () => {

  // 📦 context
  const { isLoading, isLogin, roles, logout, userInfo } = useContext(LoginContext)

  const navigate = useNavigate()

  // 🌞 회원 정보 수정
  const updateUser = async (form) => {
    console.log(form);

    let response
    let data
    try {
      response = await auth.update(form)
    } catch (error) {
      console.error(error);
      console.error(`회원정보 수정 중 에러가 발생하였습니다`);
      return
    }
    data = response.data
    const status = response.status
    console.log(`data : ${data}`);
    console.log(`status : ${status}`);

    if (status == 200) {
      console.log(`회원정보 수정 성공!`);
      Swal.alert("회원정보 수정 성공", "로그아웃 후, 다시 로그인하세요.", 'success',
        // 로그아웃 처리
        () => { logout(true) }
      )
    }
    else {
      console.log(`회원정보 수정 실패!`);
      Swal.alert("회원정보 수정 실패", "회원정보 수정에 실패하였습니다.", 'error')
    }

  }

  // 🌞 회원 탈퇴
  const deleteUser = async (username) => {
    console.log("username=" + username);

    let response
    let data
    try {
      response = await auth.remove(username)
      // response가 undefined가 아닌지 확인 후 data에 접근
      if (response && response.data) {
        data = response.data;
        const status = response.status;

        if (status === 200) {
          Swal.alert("회원탈퇴 성공", "그동안 감사했습니다🙋‍♀️", "success", () => logout(true));
        } else {
          Swal.alert("회원탈퇴 실패", "들어올 땐 마음대로 들어왔지만 나갈 땐 그럴 수 없습니다.", "error");
        }
      } else {
        console.error('응답 데이터가 없습니다.');
        Swal.fire("회원탈퇴 실패", "예기치 못한 오류가 발생했습니다.", "error");
      }

    } catch (error) {
      console.error(error);
      console.error(`회원 탈퇴 처리 중 에러가 발생하였습니다`);
    }
  }

  useEffect(() => {
    // 로딩중...
    if (isLoading) return

    // 사용자 정보가 로딩 완료 되었을 때만, 로그인 여부 체크
    if (!isLogin || !roles.isUser) {
      navigate("/login")
    }
  }, [isLoading])

  return (
    <>
      <div className="container">
        <UserForm userInfo={userInfo} updateUser={updateUser} deleteUser={deleteUser} />
      </div>
    </>
  )
}

export default User