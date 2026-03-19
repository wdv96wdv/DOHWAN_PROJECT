package com.dohwan.board.repository;

import com.dohwan.board.dto.Files.FileType;
import com.dohwan.board.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    Optional<FileEntity> findById(String id);
    void deleteById(String id);
    List<FileEntity> findByPTableAndPNo(String pTable, Long pNo);
    List<FileEntity> findByPTableAndPNoAndType(String pTable, Long pNo, FileType type);
    void deleteByPTableAndPNo(String pTable, Long pNo);
}
