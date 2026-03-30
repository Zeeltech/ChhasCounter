package com.chhas.tracker.controller;

import com.chhas.tracker.dto.ConsumptionLogDTO;
import com.chhas.tracker.dto.UpdateConsumptionRequest;
import com.chhas.tracker.service.ConsumptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class ConsumptionLogController {

    private final ConsumptionService consumptionService;

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLog(@PathVariable Long id) {
        consumptionService.deleteLog(id);
    }

    @PutMapping("/{id}")
    public ConsumptionLogDTO updateLog(
            @PathVariable Long id,
            @Valid @RequestBody UpdateConsumptionRequest request) {
        return consumptionService.updateLog(id, request);
    }
}
