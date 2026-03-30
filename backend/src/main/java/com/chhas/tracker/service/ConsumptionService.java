package com.chhas.tracker.service;

import com.chhas.tracker.dto.AddConsumptionRequest;
import com.chhas.tracker.dto.ConsumptionLogDTO;
import com.chhas.tracker.dto.UpdateConsumptionRequest;
import com.chhas.tracker.entity.BulkPack;
import com.chhas.tracker.entity.ConsumptionLog;
import com.chhas.tracker.entity.User;
import com.chhas.tracker.repository.BulkPackRepository;
import com.chhas.tracker.repository.ConsumptionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumptionService {

    private final ConsumptionLogRepository logRepository;
    private final BulkPackRepository packRepository;
    private final BulkPackService packService;
    private final UserService userService;

    @Transactional
    public ConsumptionLogDTO addConsumption(Long packId, AddConsumptionRequest request) {
        BulkPack pack = packService.findById(packId);

        if (pack.getStatus() == BulkPack.PackStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pack is already completed");
        }

        User user = userService.findById(request.getUserId());

        // Validate user is a participant
        boolean isParticipant = pack.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(user.getId()));
        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a participant of this pack");
        }

        // Validate not over-consuming
        int currentTotal = logRepository.sumQuantityByPackId(packId);
        if (currentTotal + request.getQuantity() > pack.getTotalQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot consume " + request.getQuantity() + ". Only " +
                    (pack.getTotalQuantity() - currentTotal) + " remaining");
        }

        ConsumptionLog log = new ConsumptionLog();
        log.setPack(pack);
        log.setUser(user);
        log.setQuantity(request.getQuantity());
        ConsumptionLog saved = logRepository.save(log);

        // Auto-complete check
        packService.checkAndAutoComplete(packId);

        return toDTO(saved);
    }

    public List<ConsumptionLogDTO> getLogs(Long packId) {
        packService.findById(packId); // validate pack exists
        return logRepository.findByPackIdOrderByLoggedAtDesc(packId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteLog(Long logId) {
        ConsumptionLog log = findLogById(logId);
        BulkPack pack = log.getPack();

        logRepository.delete(log);

        // Reopen pack if it was completed and is now under quantity
        if (pack.getStatus() == BulkPack.PackStatus.COMPLETED) {
            int total = logRepository.sumQuantityByPackId(pack.getId());
            if (total < pack.getTotalQuantity()) {
                pack.setStatus(BulkPack.PackStatus.ACTIVE);
                packRepository.save(pack);
            }
        }
    }

    @Transactional
    public ConsumptionLogDTO updateLog(Long logId, UpdateConsumptionRequest request) {
        ConsumptionLog log = findLogById(logId);
        BulkPack pack = log.getPack();

        int currentTotal = logRepository.sumQuantityByPackId(pack.getId());
        int newTotal = currentTotal - log.getQuantity() + request.getQuantity();

        if (newTotal > pack.getTotalQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Updated quantity would exceed pack total");
        }

        log.setQuantity(request.getQuantity());
        ConsumptionLog saved = logRepository.save(log);

        packService.checkAndAutoComplete(pack.getId());
        return toDTO(saved);
    }

    @Transactional
    public ConsumptionLogDTO undoLastEntry(Long packId) {
        ConsumptionLog last = logRepository.findTopByPackIdOrderByLoggedAtDesc(packId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No consumption entries found"));

        ConsumptionLogDTO dto = toDTO(last);
        BulkPack pack = last.getPack();

        logRepository.delete(last);

        // Reopen pack if needed
        if (pack.getStatus() == BulkPack.PackStatus.COMPLETED) {
            int total = logRepository.sumQuantityByPackId(pack.getId());
            if (total < pack.getTotalQuantity()) {
                pack.setStatus(BulkPack.PackStatus.ACTIVE);
                packRepository.save(pack);
            }
        }

        return dto;
    }

    private ConsumptionLog findLogById(Long id) {
        return logRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Log entry not found: " + id));
    }

    private ConsumptionLogDTO toDTO(ConsumptionLog log) {
        ConsumptionLogDTO dto = new ConsumptionLogDTO();
        dto.setId(log.getId());
        dto.setPackId(log.getPack().getId());
        dto.setUser(userService.toDTO(log.getUser()));
        dto.setQuantity(log.getQuantity());
        dto.setLoggedAt(log.getLoggedAt());
        return dto;
    }
}
