package com.dohwan.board.entity;

import com.dohwan.board.dto.Files.FileType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "files")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;

    @Builder.Default
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private String id = UUID.randomUUID().toString();

    @Column(name = "p_table", nullable = false)
    private String pTable;

    @Column(name = "p_no", nullable = false)
    private Long pNo;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "origin_name", nullable = false)
    private String originName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "seq")
    private Long seq;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private FileType type;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
