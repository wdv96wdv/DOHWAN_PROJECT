package com.dohwan.login;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.dohwan")
@EnableJpaRepositories(basePackages = "com.dohwan")
@EntityScan(basePackages = "com.dohwan")
@MapperScan({"com.dohwan.board.mapper", "com.dohwan.login.mapper"})
@EnableJpaAuditing
public class LoginApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoginApplication.class, args);
	}

}
