package com.chhas.tracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateBulkPackRequest {

    @NotBlank
    private String productName;

    @Min(1)
    private int totalQuantity;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal totalPrice;

    private LocalDate purchaseDate;

    @NotEmpty
    private List<Long> participantIds;
}
