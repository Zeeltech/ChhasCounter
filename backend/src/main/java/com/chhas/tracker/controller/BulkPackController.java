package com.chhas.tracker.controller;

import com.chhas.tracker.dto.*;
import com.chhas.tracker.service.BulkPackService;
import com.chhas.tracker.service.ConsumptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packs")
@RequiredArgsConstructor
public class BulkPackController {

    private final BulkPackService packService;
    private final ConsumptionService consumptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BulkPackDTO createPack(@Valid @RequestBody CreateBulkPackRequest request) {
        return packService.createPack(request);
    }

    @GetMapping
    public List<BulkPackDTO> getAllPacks() {
        return packService.getAllPacks();
    }

    @GetMapping("/active")
    public List<BulkPackDTO> getActivePacks() {
        return packService.getActivePacks();
    }

    @GetMapping("/history")
    public List<BulkPackDTO> getHistory() {
        return packService.getCompletedPacks();
    }

    @GetMapping("/{id}")
    public BulkPackDTO getPackById(@PathVariable Long id) {
        return packService.getPackById(id);
    }

    @GetMapping("/{id}/summary")
    public PackSummaryDTO getSummary(@PathVariable Long id) {
        return packService.getSummary(id);
    }

    @PutMapping("/{id}")
    public BulkPackDTO updatePack(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBulkPackRequest request) {
        return packService.updatePack(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePack(@PathVariable Long id) {
        packService.deletePack(id);
    }

    @PatchMapping("/{id}/participants")
    public BulkPackDTO updateParticipants(
            @PathVariable Long id,
            @RequestBody List<Long> participantIds) {
        return packService.updateParticipants(id, participantIds);
    }

    @PostMapping("/{id}/consume")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsumptionLogDTO addConsumption(
            @PathVariable Long id,
            @Valid @RequestBody AddConsumptionRequest request) {
        return consumptionService.addConsumption(id, request);
    }

    @GetMapping("/{id}/logs")
    public List<ConsumptionLogDTO> getLogs(@PathVariable Long id) {
        return consumptionService.getLogs(id);
    }

    @DeleteMapping("/{id}/undo")
    public ConsumptionLogDTO undoLastEntry(@PathVariable Long id) {
        return consumptionService.undoLastEntry(id);
    }
}
