package com.dohwan.board.service;

import com.dohwan.board.dto.Boards;


import org.springframework.data.domain.Page;

public interface BoardService extends BaseService<Boards> {
    Page<Boards> page(int page, int size);
    Page<Boards> page(int page, int size, String type, String keyword);
}
