package com.dohwan.login.Controller;

import com.dohwan.login.service.MarathonService;
import com.dohwan.login.entity.Marathon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/marathons") // 요청 경로 유지
public class MarathonController {

    private static final Logger log = LoggerFactory.getLogger(MarathonController.class);
    private final MarathonService marathonService;

    // 생성자 주입 방식 (권장)
    public MarathonController(MarathonService marathonService) {
        this.marathonService = marathonService;
    }

    @GetMapping
    public ResponseEntity<List<Marathon>> getAllMarathons() {
        log.info(">>> [GET] /marathons - 마라톤 목록 조회 요청");

        // 서비스에서 Supabase 데이터를 엔티티 리스트로 변환하여 가져옴
        List<Marathon> marathons = marathonService.findAllMarathons();

        if (marathons.isEmpty()) {
            log.warn(">>> 검색된 마라톤 데이터가 없습니다.");
            return ResponseEntity.noContent().build(); // 204 No Content 반환
        }

        log.info(">>> 총 {}건의 데이터 반환", marathons.size());
        return ResponseEntity.ok(marathons);
    }
}