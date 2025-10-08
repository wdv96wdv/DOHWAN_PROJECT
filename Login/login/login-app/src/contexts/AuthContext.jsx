import React, { createContext, useState, useEffect } from "react";

// 1️⃣ Context 생성
export const AuthContext = createContext();

// 2️⃣ Provider 컴포넌트
const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3️⃣ 초기 로컬스토리지 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // 4️⃣ 로그인 함수
  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

   const isLogin = !!accessToken; // ✅ 로그인 상태 판단

  // 5️⃣ 로그아웃 함수
  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLogin, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 6️⃣ default export
export default AuthContextProvider;
