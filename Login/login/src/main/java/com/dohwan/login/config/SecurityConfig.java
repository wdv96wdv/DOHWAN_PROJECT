package com.dohwan.login.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dohwan.login.security.filter.JwtAuthenticationFilter;
import com.dohwan.login.security.filter.JwtRequestFilter;
import com.dohwan.login.security.provider.JwtProvider;
import com.dohwan.login.service.UserDetailServiceImpl;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

	@Autowired
	private UserDetailServiceImpl userDetailServiceImpl;
	@Autowired
	private JwtProvider jwtProvider;
	private AuthenticationManager authenticationManager;

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		this.authenticationManager = authenticationConfiguration.getAuthenticationManager();
		return authenticationManager;
	}

	// OK : (version : after SpringSecurity 5.4 ⬆)
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// 폼 기반 로그인 비활성화
		http.formLogin(login -> login.disable());

		// HTTP 기본 인증 비활성화
		http.httpBasic(basic -> basic.disable());

		// CSRF 비활성화
		http.csrf(csrf -> csrf.disable());

		// 세션 관리: STATELESS
		http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		// 사용자 정의 인증 서비스
		http.userDetailsService(userDetailServiceImpl)
				// CORS 활성화 (Spring Security 6.1 기준)
				.cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ 명확히 지정
				.authorizeHttpRequests(auth -> auth
						// 로컬
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // preflight 허용
                        .requestMatchers("/**").permitAll() // 로컬용 전체 허용
				
						// 운영
						//.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ preflight 허용
						//.requestMatchers("/login","/join","/","/boards/**").permitAll()
						//.anyRequest().authenticated()
						);

		// JWT 필터 추가
		http.addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtProvider),
				UsernamePasswordAuthenticationFilter.class)
				.addFilterBefore(new JwtRequestFilter(authenticationManager, jwtProvider),
						UsernamePasswordAuthenticationFilter.class);

		// SecurityFilterChain 반환
		return http.build();
	}

	// 비밀번호 암호화 빈 등록
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	// ✅ Security에서 사용할 CORS 설정
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// 실제 프론트 도메인만 명시
		List<String> allowedOrigins = List.of(
				"https://dorunning.vercel.app",
				"http://localhost:5173" // 개발용
		);
		configuration.setAllowedOrigins(allowedOrigins);
		log.info("CORS 설정 - Allowed Origins: {}", allowedOrigins);

		List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
		configuration.setAllowedMethods(allowedMethods);
		log.info("CORS 설정 - Allowed Methods: {}", allowedMethods);

		List<String> allowedHeaders = List.of("*");
		configuration.setAllowedHeaders(allowedHeaders);
		log.info("CORS 설정 - Allowed Headers: {}", allowedHeaders);

		List<String> exposedHeaders = List.of("Authorization");
		configuration.setExposedHeaders(exposedHeaders);
		log.info("CORS 설정 - Exposed Headers: {}", exposedHeaders);

		configuration.setAllowCredentials(true); // 쿠키, Authorization 허용
		log.info("CORS 설정 - Allow Credentials: {}", true);

		// CORS 설정을 UrlBasedCorsConfigurationSource에 등록
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		log.info("CORS 설정 - CORS Configuration Source 등록 완료");

		return source;
	}
}