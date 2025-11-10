import React, { createContext, useEffect, useState } from 'react'
import api from '../apis/api'
import * as auth from '../apis/auth'
import * as Swal from '../apis/alert'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabaseClient'

// 📦 컨텍스트 생성
export const LoginContext = createContext()

const LoginContextProvider = ({ children }) => {

  // 🧊 state
  // 🔄 로딩 중
  const [isLoading, setIsLoading] = useState(true)
  // 🔐 로그인 여부
  const [isLogin, setIsLogin] = useState(() => {
    const savedIsLogin = localStorage.getItem("isLogin")
    return savedIsLogin ?? false
  })
  // 👩‍💼 사용자 정보
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (!savedUserInfo || savedUserInfo === "undefined") return null;
    try {
      return JSON.parse(savedUserInfo);
    } catch (e) {
      console.error("userInfo JSON parse error:", e);
      return null;
    }
  })
  // 💎 권한 정보
  const [roles, setRoles] = useState(() => {
    const savedRoles = localStorage.getItem("roles")
    return savedRoles ? JSON.parse(savedRoles) : { isUser: false, isAdmin: false }
  })

  // 페이지 이동
  const navigate = useNavigate()

  // 🔐 로그인 함수
  const login = async (username, password) => {
    console.log(`username : ${username}`);
    console.log(`password : ${password}`);

    try {
      const response = await auth.login(username, password)
      const data = response.data
      const status = response.status
      const headers = response.headers
      const authorization = headers.authorization
      const jwt = authorization.replace("Bearer ", "")

      // 로그인 성공 ✅
      if (status == 200) {
        // 💍 JWT 를 쿠키에 등록
        Cookies.set("jwt", jwt, { expires: 5 })   // 만료기간 : 5일
        localStorage.setItem("jwt", jwt); // localStorage에도 JWT 저장

        // 로그인 세팅 - loginSetting(🎫💍, 👩‍💼)
        loginSetting(authorization, data)

        // 로그인 성공 alert
        // Swal.alert(`로그인 성공`, `메인 화면으로 이동합니다.`, `success`,
        //   () => navigate("/")
        // )
        navigate("/")
      }
    } catch (error) {
      // 로그인 실패 alert
      Swal.alert(`로그인 실패`, `아이디 또는 비밀번호가 일치하지 않습니다.`, `error`)
      console.log(`로그인 실패`);
    }
  }

  /**
   * 로그인 세팅
   * @param {*} authorization : Bearer {jwt}
   * @param {*} data          : 👩‍💼 {user}
   */
  const loginSetting = (authorization, data) => {
    // 💍 JWT 를 Authorization 헤더에 등록
    api.defaults.headers.common.Authorization = authorization
    // 로그인 여부
    setIsLogin(true)
    localStorage.setItem("isLogin", "true")

    // 사용자 정보에 loginType 추가
    const updatedUserInfo = { ...data };
    // Check for provider first, then try to infer if it's a Google login
    if (updatedUserInfo.provider === 'GOOGLE' || (updatedUserInfo.email && updatedUserInfo.email.endsWith('@gmail.com'))) {
      updatedUserInfo.loginType = 'google';
    } else {
      updatedUserInfo.loginType = 'traditional';
    }
    setUserInfo(updatedUserInfo);
    localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo ?? {}))
    // 권한 정보
    const updateRoles = { isUser: false, isAdmin: false }
    data.authList.forEach((obj) => {
      if (obj.auth == 'ROLE_USER') updateRoles.isUser = true
      if (obj.auth == 'ROLE_ADMIN') updateRoles.isAdmin = true
    })
    setRoles(updateRoles)
    localStorage.setItem("roles", JSON.stringify(updateRoles))
  }


  // 자동 로그인
  // 1️⃣ 쿠키에서 jwt 가져오기
  // 2️⃣ jwt 있으면, 사용자 정보 요청
  // 3️⃣ 로그인 세팅 ( 📦 로그인 여부, 사용자 정보, 권한 )
  // 🍪 쿠키에 저장된 💍 JWT 를 읽어와서 로그인 처리
  const autoLogin = async () => {
    // 쿠키에서 jwt 가져오기
    const jwt = Cookies.get("jwt")

    if (!jwt)
      return

    const authorization = `Bearer ${jwt}`

    // 💍 JWT 를 Authorization 헤더에 등록
    api.defaults.headers.common.Authorization = authorization

    // 👩‍💼 사용자 정보 요청
    let response
    let data

    try {
      response = await auth.info()
    } catch (error) {
      console.error(`error : ${error}`);
      console.log(`status : ${response.status}`);
      return
    }

    if (response.data == 'UNAUTHORIZED' || response.status == 401) {
      console.error(`jwt 가 만료되었거나 인증에 실패하였습니다.`);
      return
    }

    // 인증 성공
    console.log(`jwt 로 자동 로그인 성공`);

    data = response.data

    // 로그인 세팅 - loginSetting( 🎫💍, 👩‍💼 )
    loginSetting(authorization, data)

  }

  // 🌞 로그아웃 함수
  const logout = (force = false) => {
    // 강제 로그아웃
    if (force) {
      // 로딩 중
      setIsLoading(true)
      // 로그아웃 세팅
      logoutSetting()
      // 페이지 이동 ➡ "/" (메인)
      navigate("/")
      // 로딩 끝
      setIsLoading(false)
      return
    }
    {
      // 로그아웃 세팅
      logoutSetting()
      // 페이지 이동 ➡ "/" (메인)
      navigate("/")
      return
    }
  }


  // 로그아웃 세팅
  const logoutSetting = () => {
    // 🎫❌ Authorization 헤더 초기화
    api.defaults.headers.common.Authorization = undefined
    // 🔐❌ 로그인 여부  false
    setIsLogin(false)
    localStorage.removeItem("isLogin")
    // 👩‍💼❌ 유저 정보 초기화
    setUserInfo(null)
    localStorage.removeItem("userInfo")
    // 💎❌ 권한 정보 초기화
    setRoles({ isUser: false, isAdmin: false })
    localStorage.removeItem("roles")
    // 🍪❌ 쿠키 제거
    Cookies.remove("jwt")
    // 🗑❌ localStorage JWT 제거
    localStorage.removeItem("jwt");
  }

  useEffect(() => {
    const savedIsLogin = localStorage.getItem("isLogin")
    if (!savedIsLogin || savedIsLogin == false) {
      autoLogin()
    }

  }, [])

  const loginWithSocial = (jwt, userData) => {
    const authorization = `Bearer ${jwt}`;
    Cookies.set("jwt", jwt, { expires: 5 }); // 쿠키 저장
    localStorage.setItem("jwt", jwt); // localStorage에도 JWT 저장

    // ✅ userData 안에 userInfo가 들어있다면 분리해서 전달
    const userInfo = userData.userInfo ?? userData; // 백엔드가 userInfo 포함했을 경우 대응

    loginSetting(authorization, userInfo);  // 기존 로그인 세팅 재사용
    navigate("/"); // 로그인 후 메인으로 이동
  };

  // 사용자 정보 업데이트 (비밀번호 변경 없이 정보만 변경 시)
  const updateUserInfo = async () => {
    try {
      const response = await auth.info();
      if (response.data && response.status === 200) {
        const updatedUserInfo = response.data;
        
        // Supabase에서 프로필 정보 가져오기
        if (updatedUserInfo.no) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('avatar_url, bio')
              .eq('no', updatedUserInfo.no)
              .single();
            
            if (!profileError && profileData) {
              // 프로필 정보 병합
              updatedUserInfo.avatarUrl = profileData.avatar_url;
              updatedUserInfo.bio = profileData.bio;
            }
          } catch (profileErr) {
            console.warn('프로필 정보 조회 실패 (무시):', profileErr);
          }
        }
        
        setUserInfo(updatedUserInfo);
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo ?? {}));
        
        // 권한 정보도 업데이트
        const updateRoles = { isUser: false, isAdmin: false };
        if (updatedUserInfo.authList) {
          updatedUserInfo.authList.forEach((obj) => {
            if (obj.auth == 'ROLE_USER') updateRoles.isUser = true;
            if (obj.auth == 'ROLE_ADMIN') updateRoles.isAdmin = true;
          });
        }
        setRoles(updateRoles);
        localStorage.setItem("roles", JSON.stringify(updateRoles));
        return true;
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
    return false;
  };

  return (
    // 컨텍스트 값 지정 ➡ value{ ?, ? }
    <LoginContext.Provider value={{ isLogin, login, loginWithSocial, userInfo, roles, isLoading, logout, updateUserInfo }}>
      {children}
    </LoginContext.Provider>
  )
}

export default LoginContextProvider