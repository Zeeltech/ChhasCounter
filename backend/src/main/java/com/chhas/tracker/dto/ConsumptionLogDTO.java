package com.chhas.tracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConsumptionLogDTO {
    private Long id;
    private Long packId;
    private UserDTO user;
    private int quantity;
    private LocalDateTime loggedAt;
}
