
# JWT Spring Secrurity

0. 프로젝트 설정
 - 데이터 소스
 - 시크릿 키 (JWT)


1. 테이블 생성
 - users       : 회원
 - user_auth   : 회원권한

2. User  도메인 세팅
 - Users.java
 - UserAuth.java
 - UserMapper.xml
 - UserMapper.java
 - UserService.java
 - UserServiceImpl.java
 - CustomUser.java
 - AuthenticationRequest.java
 - UserDetailServiceImpl.java

3. JWT 관련 프로세스
 - JWT 인증 필터 : JwtAuthenticationFilter.java
 - JWT 요청 필터 : JwtRequestFilter.java

4. Spring Security 설정
 - 폼기반 로그인 등 비활성화
 - JWT 필터 설정
  - JWT 인증 필터
  - JWT 요청 필터
- 사용자 정의 인증 설정
- 암화 방식 빈등록 (Bcrypt)

5. 엔드포인트 설정 (Controller)
  LoginController.java
 - /login   : 로그인 인증후, 💍 jwt 응답
 - /user    : 💍jwt 헤더 검증, 유저 정보 응답 

 UserController.java
 [GET]    /users/info         : 사용자 정보 조회
 [POST]   /users              : 회원 가입
 [PUT]    /users              : 회원 정보 수정
 [DELETE] /users/{username}   : 회원 탈퇴


# 🏃‍♂️ DOHWAN_PROJECT - DoRunning

운동을 시작하려는 사람부터 마라톤을 실전으로 치른 사람까지, 목표 달성 운동으로 달리기의 즐거움을 함께 나누는 러닝 커뮤니티 플랫폼입니다.

---

## 🚀 주요 기능

- 사용자 로그인 및 회원가입 (JWT 인증)
- 러닝 코스 조회 및 기록 관리
- 마일리지 적립 및 이벤트 참여
- 커뮤니티 게시판
- 관리자 문의 관리 기능

---

## 🛠️ 기술 스택

- **Frontend**: React + Vite + React Router
- **Backend**: Spring Boot (API 연동)
- **Auth**: JWT + Cookies
- **UI**: CSS Modules, SweetAlert2
- **기타**: Axios, Firebase

---

## 📁 폴더 구조
Login/ ├── login/ │   ├── login-app/ │   │   ├── src/ │   │   │   ├── pages/         # 주요 페이지 컴포넌트 │   │   │   ├── components/    # 공통 컴포넌트 │   │   │   ├── assets/        # CSS 및 이미지 │   │   │   ├── apis/          # API 호출 모듈 │   │   │   ├── contexts/      # 로그인 상태 관리 │   │   │   └── App.jsx        # 루트 컴포넌트

---


