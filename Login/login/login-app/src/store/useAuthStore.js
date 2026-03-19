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
      const data = response.data;
      const status = response.status;
      const headers = response.headers;
      const authorization = headers.authorization;
      const jwt = authorization.replace("Bearer ", "");

      if (status === 200) {
        Cookies.set("jwt", jwt, { expires: 5 });
        localStorage.setItem("jwt", jwt);
        get().loginSetting(authorization, data);
        if (navigate) navigate("/");
      }
    } catch (error) {
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
      const response = await auth.info();
      if (response.data === 'UNAUTHORIZED' || response.status === 401) {
        set({ isLoading: false });
        return;
      }
      get().loginSetting(authorization, response.data);
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
        const updatedUserInfo = response.data;

        if (updatedUserInfo.no) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('avatar_url, bio')
              .eq('no', updatedUserInfo.no)
              .single();

            if (!profileError && profileData) {
              updatedUserInfo.avatarUrl = profileData.avatar_url;
              updatedUserInfo.bio = profileData.bio;
            }
          } catch (profileErr) {
            console.warn('프로필 정보 조회 실패:', profileErr);
          }
        }

        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo ?? {}));
        
        const updateRoles = { isUser: false, isAdmin: false };
        if (updatedUserInfo.authList) {
          updatedUserInfo.authList.forEach((obj) => {
            if (obj.auth === 'ROLE_USER') updateRoles.isUser = true;
            if (obj.auth === 'ROLE_ADMIN') updateRoles.isAdmin = true;
          });
        }
        localStorage.setItem("roles", JSON.stringify(updateRoles));

        set({ userInfo: updatedUserInfo, roles: updateRoles });
        return true;
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
    return false;
  }
}));

export default useAuthStore;
