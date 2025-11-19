package com.dohwan.login.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistDto {
    private String productId;
    private String title;
    private String link;
    private String image;
    private Integer lprice;
}

