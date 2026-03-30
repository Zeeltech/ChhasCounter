package com.chhas.tracker.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateConsumptionRequest {
    @Min(1)
    private int quantity;
}
