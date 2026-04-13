import { create } from 'zustand';
import api from '../apis/api';
import * as auth from '../apis/auth';
import * as Swal from '../apis/alert';
import Cookies from 'js-cookie';
import supabase from '../utils/supabaseClient';

const useAuthStore = create((set, get) => ({
  isLoading: true,
  isLogin: localStorage.getItem("isLogin") === "true",
  userInfo: localStorage.getItem("userInfo") && localStorage.getItem("userInfo") !== "undefined"
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  roles: localStorage.getItem("roles")
    ? JSON.parse(localStorage.getItem("roles"))
    : { isUser: false, isAdmin: false },

  loginSetting: (authorization, data) => {
    api.defaults.headers.common.Authorization = authorization;
    localStorage.setItem("isLogin", "true");

    const updatedUserInfo = { ...data };
    
    // 소셜 로그인(구글 등)에서 오는 이미지 필드를 avatarUrl로 정규화
    if (!updatedUserInfo.avatarUrl && !updatedUserInfo.avatar_url) {
      updatedUserInfo.avatarUrl = data.picture || data.profileImage || data.thumbnail || data.profile_image;
    }

    if (updatedUserInfo.provider === 'GOOGLE' || (updatedUserInfo.email && updatedUserInfo.email.endsWith('@gmail.com'))) {
      updatedUserInfo.loginType = 'google';
    } else {
      updatedUserInfo.loginType = 'traditional';
    }

    localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo ?? {}));

    const updateRoles = { isUser: false, isAdmin: false };
    if (data.authList) {
      data.authList.forEach((obj) => {
        if (obj.auth === 'ROLE_USER') updateRoles.isUser = true;
        if (obj.auth === 'ROLE_ADMIN') updateRoles.isAdmin = true;
      });
    }
    localStorage.setItem("roles", JSON.stringify(updateRoles));

    set({ isLogin: true, userInfo: updatedUserInfo, roles: updateRoles });
  },

  logoutSetting: () => {
    api.defaults.headers.common.Authorization = undefined;
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("roles");
    Cookies.remove("jwt");
    localStorage.removeItem("jwt");
    
    set({
      isLogin: false,
      userInfo: null,
      roles: { isUser: false, isAdmin: false }
    });
  },

  login: async (username, password, navigate) => {
    try {
      const response = await auth.login(username, password);
      // Backend (JwtAuthenticationFilter) now returns ApiResponse<User>
      if (response.status === 200) {
        const authorization = response.headers['authorization'];
        if (authorization) {
          api.defaults.headers.common.Authorization = authorization;
          localStorage.setItem("isLogin", "true");
        }
        // Fetch full user info including Supabase profile after login
        await get().updateUserInfo();
        if (navigate) navigate("/");
      }
    } catch (error) {
      console.error(error);
      Swal.alert(`로그인 실패`, `아이디 또는 비밀번호가 일치하지 않습니다.`, `error`);
    }
  },

  autoLogin: async () => {
    const jwt = Cookies.get("jwt") || localStorage.getItem("jwt");
    if (!jwt) {
      set({ isLoading: false });
      return;
    }

    const authorization = `Bearer ${jwt}`;
    api.defaults.headers.common.Authorization = authorization;

    try {
      await get().updateUserInfo();
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: (force = false, navigate) => {
    if (force) set({ isLoading: true });
    get().logoutSetting();
    if (navigate) navigate("/");
    if (force) set({ isLoading: false });
  },

  loginWithSocial: (jwt, userData, navigate) => {
    const authorization = `Bearer ${jwt}`;
    Cookies.set("jwt", jwt, { expires: 5 });
    localStorage.setItem("jwt", jwt);

    const userInfo = userData.userInfo ?? userData;
    get().loginSetting(authorization, userInfo);
    if (navigate) navigate("/");
  },

  updateUserInfo: async () => {
    try {
      const response = await auth.info();
      if (response.data && response.status === 200) {
        const updatedUserInfo = response.data.data;

        if (updatedUserInfo.no) {
          // profiles 테이블 제거됨 -> 모든 정보는 users 테이블(auth.info)에서 가져옴
        }

        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo ?? {}));
        
        const updateRoles = { isUser: false, isAdmin: false };
        if (updatedUserInfo.authList) {
          updatedUserInfo.authList.forEach((obj) => {
            if (obj.auth === 'ROLE_USER') updateRoles.isUser = true;
            if (obj.auth === 'ROLE_ADMIN') updateRoles.isAdmin = true;
          });
        }
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("roles", JSON.stringify(updateRoles));

        set({ isLogin: true, userInfo: updatedUserInfo, roles: updateRoles });
        return true;
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
    return false;
  }
}));

export default useAuthStore;
