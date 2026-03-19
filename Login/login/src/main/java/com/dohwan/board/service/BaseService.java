package com.dohwan.board.service;

import java.util.List;
import org.springframework.data.domain.Page;

public interface BaseService<E> {
    List<E> list();
    Page<E> page(int page, int size);
    E select(int no);
    E selectById(String id);
    boolean insert(E entity);
    boolean update(E entity);
    boolean updateById(E entity);
    boolean delete(int no);
    boolean deleteById(String id);
}
