package com.chhas.tracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private String avatarUrl;
}
