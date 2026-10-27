# 1. Base image
FROM gradle:8.3-jdk17 AS build

WORKDIR /app

# 프로젝트 파일 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
COPY src src

# Gradle build
RUN chmod +x gradlew
RUN ./gradlew build -x test

# 2. Run stage
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app

# 빌드 결과 JAR 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 실행 (Render 512MB 메모리 제한 환경 최적화: SerialGC 및 힙/메타스페이스 제한)
CMD ["java", "-Xms128m", "-Xmx280m", "-XX:+UseSerialGC", "-Xss512k", "-XX:MaxMetaspaceSize=128m", "-jar", "app.jar"]
