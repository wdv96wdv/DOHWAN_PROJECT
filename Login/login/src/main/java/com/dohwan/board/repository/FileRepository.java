package com.dohwan.board.repository;

import com.dohwan.board.dto.Files.FileType;
import com.dohwan.board.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    
    @Query("SELECT f FROM FileEntity f WHERE f.id = :id")
    Optional<FileEntity> findByIdentifier(@Param("id") String id);

    @Modifying
    @Query("DELETE FROM FileEntity f WHERE f.id = :id")
    void deleteByIdentifier(@Param("id") String id);

    @Query("SELECT f FROM FileEntity f WHERE f.pTable = :pTable AND f.pNo = :pNo")
    List<FileEntity> findByParent(@Param("pTable") String pTable, @Param("pNo") Long pNo);

    @Query("SELECT f FROM FileEntity f WHERE f.pTable = :pTable AND f.pNo = :pNo AND f.type = :type")
    List<FileEntity> findByParentAndType(@Param("pTable") String pTable, @Param("pNo") Long pNo, @Param("type") FileType type);

    @Modifying
    @Query("DELETE FROM FileEntity f WHERE f.pTable = :pTable AND f.pNo = :pNo")
    void deleteByParent(@Param("pTable") String pTable, @Param("pNo") Long pNo);
}
