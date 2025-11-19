package com.dohwan.login.controller;

import com.dohwan.login.domain.CustomUser;
import com.dohwan.login.entity.Wishlist;
import com.dohwan.login.domain.WishlistDto;
import com.dohwan.login.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // 현재 사용자의 찜 목록 조회
    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlist(@AuthenticationPrincipal CustomUser user) {
        // CustomUser에서 user_no를 가져옵니다.
        Long userNo = user.getUserNo(); // CustomUser에 getUserNo() 메소드가 있다고 가정
        List<Wishlist> wishlist = wishlistService.getWishlist(userNo);
        return ResponseEntity.ok(wishlist);
    }

    // 찜 목록에 아이템 추가
    @PostMapping
    public ResponseEntity<Void> addWishlist(@AuthenticationPrincipal CustomUser user,
                                            @RequestBody WishlistDto wishlistItem) {
        // CustomUser에서 user_no를 가져옵니다.
        Long userNo = user.getUserNo(); // CustomUser에 getUserNo() 메소드가 있다고 가정
        wishlistService.addWishlist(userNo, wishlistItem);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 찜 목록에서 아이템 삭제
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteWishlist(@AuthenticationPrincipal CustomUser user,
                                              @PathVariable String productId) {
        // CustomUser에서 user_no를 가져옵니다.
        Long userNo = user.getUserNo(); // CustomUser에 getUserNo() 메소드가 있다고 가정
        wishlistService.deleteWishlist(userNo, productId);
        return ResponseEntity.noContent().build();
    }
}