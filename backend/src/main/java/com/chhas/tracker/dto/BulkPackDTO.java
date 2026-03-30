package com.chhas.tracker.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BulkPackDTO {
    private Long id;
    private String productName;
    private int totalQuantity;
    private BigDecimal totalPrice;
    private LocalDate purchaseDate;
    private String status;
    private LocalDateTime createdAt;
    private List<UserDTO> participants;
    private int totalConsumed;
}
