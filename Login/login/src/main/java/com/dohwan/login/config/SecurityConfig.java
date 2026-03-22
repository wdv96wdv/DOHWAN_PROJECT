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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dohwan.login.security.filter.JwtAuthenticationFilter;
import com.dohwan.login.security.filter.JwtRequestFilter;
import com.dohwan.login.security.filter.RequestLogger;
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

	// AuthenticationManager bean definition
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	// OK : (version : after SpringSecurity 5.4 ⬆)
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager)
			throws Exception {
		// 최상단 로깅 필터 추가
		http.addFilterBefore(new RequestLogger(), UsernamePasswordAuthenticationFilter.class);

		// 폼 기반 로그인 비활성화
		http.formLogin(login -> login.disable());

		// HTTP 기본 인증 비활성화
		http.httpBasic(basic -> basic.disable());

		// 세션 관리: STATELESS
		http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		// CORS 및 CSRF 설정 (가장 먼저 설정 권장)
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable());

		// 사용자 정의 인증 서비스 등록
		http.userDetailsService(userDetailServiceImpl);

		// 요청 권한 설정
		http.authorizeHttpRequests(auth -> auth
				.requestMatchers(new AntPathRequestMatcher("/**", "OPTIONS")).permitAll() // ✅ preflight 허용
				.requestMatchers(new AntPathRequestMatcher("/login")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/users")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/join")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/contact")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/boards/**")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/api/wishlist/**")).authenticated()
				.requestMatchers(new AntPathRequestMatcher("/admin/**")).hasRole("ADMIN")
				.requestMatchers(new AntPathRequestMatcher("/manifest.json")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/auth/check-username")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/auth/social-login", "POST")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/error")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/marathons/**")).permitAll()
				.requestMatchers(new AntPathRequestMatcher("/api/marathons/**")).permitAll()

				.anyRequest().authenticated())
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint((request, response, authException) -> {
							log.warn("::::: 인증 실패 (401) : {} :::::", request.getRequestURI());
							log.warn("에러 메시지: {}", authException.getMessage());
							response.setStatus(401);
							response.setContentType("application/json;charset=UTF-8");
							response.getWriter().write("{\"status\":401,\"message\":\"UNAUTHORIZED\"}");
						})
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							log.warn("::::: 인가 거부 (403) : {} :::::", request.getRequestURI());
							log.warn("에러 메시지: {}", accessDeniedException.getMessage());
							response.setStatus(403);
							response.setContentType("application/json;charset=UTF-8");
							response.getWriter().write("{\"status\":403,\"message\":\"FORBIDDEN\"}");
						}));

		// JWT 필터 추가
		http.addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtProvider),
				UsernamePasswordAuthenticationFilter.class)
				.addFilterBefore(new JwtRequestFilter(authenticationManager, jwtProvider),
						UsernamePasswordAuthenticationFilter.class);

		// SecurityFilterChain 반환
		return http.build();
	}

	// ✅ Security에서 사용할 CORS 설정
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// 실제 프론트 도메인 및 로컬 환경 허용
		List<String> allowedOrigins = List.of(
				"https://dorunning.vercel.app",
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"http://localhost:3000",
				"http://127.0.0.1:3000");
		configuration.setAllowedOrigins(allowedOrigins);
		log.info("CORS 설정 - Allowed Origins: {}", allowedOrigins);

		List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
		configuration.setAllowedMethods(allowedMethods);
		log.info("CORS 설정 - Allowed Methods: {}", allowedMethods);

		List<String> allowedHeaders = List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin",
				"Access-Control-Request-Method", "Access-Control-Request-Headers");
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
