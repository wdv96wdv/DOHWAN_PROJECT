package com.dohwan.login.Controller;

import com.dohwan.login.service.MarathonService;
import com.dohwan.login.entity.Marathon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marathons")
public class MarathonController {

    private static final Logger log = LoggerFactory.getLogger(MarathonController.class);
    private final MarathonService marathonService;

    public MarathonController(MarathonService marathonService) {
        this.marathonService = marathonService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/crawl")
    public ResponseEntity<String> triggerCrawl() {
        log.warn(">>> [크롤링 요청 거부] 외부 사이트 크롤링이 중단되었습니다.");
        return ResponseEntity.ok("크롤링 기능이 중단되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<Marathon>> getAllMarathons() {
        log.info(">>> [GET] /marathons - 마라톤 목록 조회 요청");
        List<Marathon> marathons = marathonService.findAllMarathons();
        return ResponseEntity.ok(marathons);
    }

    @PostMapping
    public ResponseEntity<Marathon> registerMarathon(@RequestBody Marathon marathon) {
        log.info(">>> [POST] /marathons - 마라톤 신규 등록 요청: {}", marathon.getTitle());
        Marathon saved = marathonService.registerMarathon(marathon);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marathon> getMarathonById(@PathVariable("id") Long id) {
        log.info(">>> [GET] /marathons/{} - 마라톤 상세 조회 요청", id);
        return marathonService.findMarathonById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}