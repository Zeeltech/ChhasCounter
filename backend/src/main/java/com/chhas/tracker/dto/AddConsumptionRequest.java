package com.chhas.tracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddConsumptionRequest {
    @NotNull
    private Long userId;

    @Min(1)
    private int quantity;
}
