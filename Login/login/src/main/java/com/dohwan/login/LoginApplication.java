package com.dohwan.login;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.dohwan")
@EnableJpaRepositories(basePackages = {"com.dohwan.login.repository", "com.dohwan.contact.repository"})
@EntityScan(basePackages = {"com.dohwan.login.entity", "com.dohwan.contact.entity"})
@MapperScan({"com.dohwan.board.mapper", "com.dohwan.login.mapper"})
public class LoginApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoginApplication.class, args);
	}

}
