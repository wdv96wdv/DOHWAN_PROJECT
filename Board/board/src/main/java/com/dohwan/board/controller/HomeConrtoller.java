package com.dohwan.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeConrtoller {
    @GetMapping("/")
    public String home() {
        return "redirect:/swagger-ui/index.html"; // index.html 파일을 반환
    }   
}
