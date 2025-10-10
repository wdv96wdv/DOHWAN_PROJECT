package com.dohwan.board.mapper;

import java.util.List;

public interface BaseMapper<E> {
    List<E> list();
    E select(int no);
    E selectById(String id);
    int insert(E entity);
    int update(E entity);
    int updateById(E entity);
    int delete(int no);
    int deleteById(String id);
}