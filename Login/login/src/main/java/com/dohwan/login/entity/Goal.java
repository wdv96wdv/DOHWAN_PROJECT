package com.dohwan.login.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "goal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private double targetValue;
    private String unit;

    @Column(name = "user_no")
    private Long userNo;
}
