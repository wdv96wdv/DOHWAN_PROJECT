package com.dohwan.login.repository;

import com.dohwan.login.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserNo(Long userNo);
    void deleteByUserNoAndProductId(Long userNo, String productId);
}
