package com.dohwan.login.Controller;

import com.dohwan.login.service.NaverShoppingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/naver-shopping")
public class NaverShoppingController {

    private final NaverShoppingService naverShoppingService;

    public NaverShoppingController(NaverShoppingService naverShoppingService) {
        this.naverShoppingService = naverShoppingService;
    }

    @GetMapping
    public ResponseEntity<String> searchShopping(
            @RequestParam("query") String query,
            @RequestParam(value = "display", defaultValue = "9") int display,
            @RequestParam(value = "start", defaultValue = "1") int start) {
            
        String result = naverShoppingService.searchShopping(query, display, start);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }
}
