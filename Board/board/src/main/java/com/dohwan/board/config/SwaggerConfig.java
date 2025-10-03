package com.dohwan.board.config;    

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {
 
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("dohwan") // 그룹명 설정
                .pathsToMatch("/**") // 경로 설정
                .build();
                
    }

    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("두환 API 게시판")
                        .description("게시판 프로젝트 API 입니다.")
                        .version("v0.0.1"));
    }

    
    
}