package com.dohwan.login.service;

import com.dohwan.login.domain.WishlistDto;
import com.dohwan.login.entity.Wishlist;
import com.dohwan.login.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public List<Wishlist> getWishlist(Long userNo) {
        return wishlistRepository.findByUserNo(userNo);
    }

    public void addWishlist(Long userNo, WishlistDto wishlistItemDto) {
        Wishlist wishlist = new Wishlist();
        wishlist.setUserNo(userNo);
        wishlist.setProductId(wishlistItemDto.getProductId());
        wishlist.setTitle(wishlistItemDto.getTitle());
        wishlist.setLink(wishlistItemDto.getLink());
        wishlist.setImage(wishlistItemDto.getImage());
        wishlist.setLprice(wishlistItemDto.getLprice());
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void deleteWishlist(Long userNo, String productId) {
        wishlistRepository.deleteByUserNoAndProductId(userNo, productId);
    }
}

