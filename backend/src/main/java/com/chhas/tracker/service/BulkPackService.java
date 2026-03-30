package com.chhas.tracker.service;

import com.chhas.tracker.dto.*;
import com.chhas.tracker.entity.BulkPack;
import com.chhas.tracker.entity.User;
import com.chhas.tracker.repository.BulkPackRepository;
import com.chhas.tracker.repository.ConsumptionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulkPackService {

    private final BulkPackRepository packRepository;
    private final ConsumptionLogRepository logRepository;
    private final UserService userService;

    @Transactional
    public BulkPackDTO createPack(CreateBulkPackRequest request) {
        BulkPack pack = new BulkPack();
        pack.setProductName(request.getProductName().trim());
        pack.setTotalQuantity(request.getTotalQuantity());
        pack.setTotalPrice(request.getTotalPrice());
        pack.setPurchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now());

        for (Long uid : request.getParticipantIds()) {
            User u = userService.findById(uid);
            pack.getParticipants().add(u);
        }

        return toDTO(packRepository.save(pack));
    }

    public List<BulkPackDTO> getActivePacks() {
        return packRepository.findByStatusOrderByCreatedAtDesc(BulkPack.PackStatus.ACTIVE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<BulkPackDTO> getCompletedPacks() {
        return packRepository.findByStatusOrderByCreatedAtDesc(BulkPack.PackStatus.COMPLETED)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<BulkPackDTO> getAllPacks() {
        return packRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public BulkPackDTO getPackById(Long id) {
        return toDTO(findById(id));
    }

    @Transactional
    public BulkPackDTO updateParticipants(Long packId, List<Long> participantIds) {
        BulkPack pack = findById(packId);
        pack.getParticipants().clear();
        for (Long uid : participantIds) {
            pack.getParticipants().add(userService.findById(uid));
        }
        return toDTO(packRepository.save(pack));
    }

    @Transactional
    public BulkPackDTO updatePack(Long packId, UpdateBulkPackRequest request) {
        BulkPack pack = findById(packId);

        int currentConsumed = logRepository.sumQuantityByPackId(packId);
        if (request.getTotalQuantity() < currentConsumed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "New total quantity (" + request.getTotalQuantity() + ") cannot be less than already consumed (" + currentConsumed + ")");
        }

        pack.setProductName(request.getProductName().trim());
        pack.setTotalQuantity(request.getTotalQuantity());
        pack.setTotalPrice(request.getTotalPrice());
        if (request.getPurchaseDate() != null) {
            pack.setPurchaseDate(request.getPurchaseDate());
        }

        pack.getParticipants().clear();
        for (Long uid : request.getParticipantIds()) {
            pack.getParticipants().add(userService.findById(uid));
        }

        // Re-evaluate completion status after quantity change
        if (pack.getStatus() == BulkPack.PackStatus.COMPLETED && currentConsumed < request.getTotalQuantity()) {
            pack.setStatus(BulkPack.PackStatus.ACTIVE);
        } else if (pack.getStatus() == BulkPack.PackStatus.ACTIVE && currentConsumed >= request.getTotalQuantity()) {
            pack.setStatus(BulkPack.PackStatus.COMPLETED);
        }

        return toDTO(packRepository.save(pack));
    }

    @Transactional
    public void deletePack(Long packId) {
        BulkPack pack = findById(packId);
        logRepository.deleteAll(logRepository.findByPackIdOrderByLoggedAtDesc(packId));
        pack.getParticipants().clear();
        packRepository.save(pack);
        packRepository.delete(pack);
    }

    public PackSummaryDTO getSummary(Long packId) {
        BulkPack pack = findById(packId);
        int totalConsumed = logRepository.sumQuantityByPackId(packId);
        List<Object[]> perUser = logRepository.sumQuantityPerUserByPackId(packId);

        BigDecimal perUnit = pack.getTotalPrice()
                .divide(BigDecimal.valueOf(pack.getTotalQuantity()), 4, RoundingMode.HALF_UP);

        // Build a user-id to user map from participants
        Map<Long, User> participantMap = pack.getParticipants()
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        List<PackSummaryDTO.UserCostDTO> breakdown = new ArrayList<>();
        for (Object[] row : perUser) {
            Long userId = ((Number) row[0]).longValue();
            int consumed = ((Number) row[1]).intValue();
            User u = participantMap.get(userId);
            if (u == null) continue;

            PackSummaryDTO.UserCostDTO ucd = new PackSummaryDTO.UserCostDTO();
            ucd.setUserId(userId);
            ucd.setUserName(u.getName());
            ucd.setConsumed(consumed);
            ucd.setTotalCost(perUnit.multiply(BigDecimal.valueOf(consumed)).setScale(2, RoundingMode.HALF_UP));
            breakdown.add(ucd);
        }

        // Users with zero consumption
        for (User p : pack.getParticipants()) {
            boolean found = breakdown.stream().anyMatch(b -> b.getUserId().equals(p.getId()));
            if (!found) {
                PackSummaryDTO.UserCostDTO ucd = new PackSummaryDTO.UserCostDTO();
                ucd.setUserId(p.getId());
                ucd.setUserName(p.getName());
                ucd.setConsumed(0);
                ucd.setTotalCost(BigDecimal.ZERO);
                breakdown.add(ucd);
            }
        }

        PackSummaryDTO summary = new PackSummaryDTO();
        summary.setPackId(packId);
        summary.setProductName(pack.getProductName());
        summary.setTotalQuantity(pack.getTotalQuantity());
        summary.setTotalConsumed(totalConsumed);
        summary.setRemaining(pack.getTotalQuantity() - totalConsumed);
        summary.setTotalPrice(pack.getTotalPrice());
        summary.setPerUnitCost(perUnit.setScale(2, RoundingMode.HALF_UP));
        summary.setStatus(pack.getStatus().name());
        summary.setUserBreakdown(breakdown);
        return summary;
    }

    public void checkAndAutoComplete(Long packId) {
        BulkPack pack = findById(packId);
        if (pack.getStatus() == BulkPack.PackStatus.ACTIVE) {
            int totalConsumed = logRepository.sumQuantityByPackId(packId);
            if (totalConsumed >= pack.getTotalQuantity()) {
                pack.setStatus(BulkPack.PackStatus.COMPLETED);
                packRepository.save(pack);
            }
        }
    }

    public BulkPack findById(Long id) {
        return packRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pack not found: " + id));
    }

    private BulkPackDTO toDTO(BulkPack pack) {
        BulkPackDTO dto = new BulkPackDTO();
        dto.setId(pack.getId());
        dto.setProductName(pack.getProductName());
        dto.setTotalQuantity(pack.getTotalQuantity());
        dto.setTotalPrice(pack.getTotalPrice());
        dto.setPurchaseDate(pack.getPurchaseDate());
        dto.setStatus(pack.getStatus().name());
        dto.setCreatedAt(pack.getCreatedAt());
        dto.setParticipants(pack.getParticipants().stream()
                .map(userService::toDTO)
                .collect(Collectors.toList()));
        dto.setTotalConsumed(logRepository.sumQuantityByPackId(pack.getId()));
        return dto;
    }
}
