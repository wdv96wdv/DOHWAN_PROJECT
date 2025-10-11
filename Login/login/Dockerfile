# 1. JDK 이미지 사용
FROM eclipse-temurin:17-jdk-jammy

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. Gradle 빌드 결과(JAR) 복사
COPY build/libs/*.jar app.jar

# 4. 환경변수로 Spring 프로파일 지정 (기본 prod)
# 로컬 개발 시 docker run -e SPRING_PROFILES_ACTIVE=local
ENV SPRING_PROFILES_ACTIVE=prod

# 5. 컨테이너 실행
ENTRYPOINT ["java","-jar","-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}","/app/app.jar"]
