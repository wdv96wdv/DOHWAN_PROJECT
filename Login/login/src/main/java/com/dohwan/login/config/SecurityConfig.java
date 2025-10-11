package com.dohwan.login.config;

import static org.springframework.security.config.Customizer.withDefaults;

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
		http.userDetailsService(userDetailServiceImpl);

		// CORS 활성화 (Spring Security 6.1 기준)
		http.cors(withDefaults())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ preflight 허용
						.requestMatchers("/login", "/join").permitAll()
						.anyRequest().authenticated());

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
		// 개발/테스트: 모든 도메인 허용
		configuration.setAllowedOriginPatterns(List.of("*"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}