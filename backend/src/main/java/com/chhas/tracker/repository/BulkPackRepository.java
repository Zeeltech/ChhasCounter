package com.chhas.tracker.repository;

import com.chhas.tracker.entity.BulkPack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkPackRepository extends JpaRepository<BulkPack, Long> {
    List<BulkPack> findByStatusOrderByCreatedAtDesc(BulkPack.PackStatus status);
    List<BulkPack> findAllByOrderByCreatedAtDesc();
}
