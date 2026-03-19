package com.dohwan.login.Controller;

import com.dohwan.login.common.ApiResponse;
import com.dohwan.login.dto.CustomUser;
import com.dohwan.login.entity.Wishlist;
import com.dohwan.login.dto.WishlistDto;
import com.dohwan.login.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /** 현재 사용자의 찜 목록 조회 */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Wishlist>>> getWishlist(@AuthenticationPrincipal CustomUser user) {
        Long userNo = user.getUserNo();
        List<Wishlist> wishlist = wishlistService.getWishlist(userNo);
        return ResponseEntity.ok(ApiResponse.success(wishlist));
    }

    /** 찜 목록에 아이템 추가 */
    @PostMapping
    public ResponseEntity<ApiResponse<String>> addWishlist(
            @AuthenticationPrincipal CustomUser user,
            @RequestBody WishlistDto wishlistItem) {
        Long userNo = user.getUserNo();
        wishlistService.addWishlist(userNo, wishlistItem);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("찜 목록에 추가되었습니다."));
    }

    /** 찜 목록에서 아이템 삭제 */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<String>> deleteWishlist(
            @AuthenticationPrincipal CustomUser user,
            @PathVariable String productId) {
        Long userNo = user.getUserNo();
        wishlistService.deleteWishlist(userNo, productId);
        return ResponseEntity.ok(ApiResponse.success("찜 목록에서 삭제되었습니다."));
    }
}
