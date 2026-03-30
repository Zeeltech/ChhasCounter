package com.chhas.tracker.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PackSummaryDTO {
    private Long packId;
    private String productName;
    private int totalQuantity;
    private int totalConsumed;
    private int remaining;
    private BigDecimal totalPrice;
    private BigDecimal perUnitCost;
    private String status;
    private List<UserCostDTO> userBreakdown;

    @Data
    public static class UserCostDTO {
        private Long userId;
        private String userName;
        private int consumed;
        private BigDecimal totalCost;
    }
}
