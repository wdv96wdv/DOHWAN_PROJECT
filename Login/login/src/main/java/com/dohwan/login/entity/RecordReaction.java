package com.dohwan.login.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "record_reaction", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"record_no", "user_no"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_no", nullable = false)
    private Records record;

    @Column(name = "user_no", nullable = false)
    private Long userNo;

    @Column(name = "reaction_type")
    @Builder.Default
    private String reactionType = "LIKE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
