package com.chhas.tracker.repository;

import com.chhas.tracker.entity.ConsumptionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConsumptionLogRepository extends JpaRepository<ConsumptionLog, Long> {

    List<ConsumptionLog> findByPackIdOrderByLoggedAtDesc(Long packId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM ConsumptionLog c WHERE c.pack.id = :packId")
    int sumQuantityByPackId(Long packId);

    @Query("SELECT c.user.id, SUM(c.quantity) FROM ConsumptionLog c WHERE c.pack.id = :packId GROUP BY c.user.id")
    List<Object[]> sumQuantityPerUserByPackId(Long packId);

    Optional<ConsumptionLog> findTopByPackIdOrderByLoggedAtDesc(Long packId);

    boolean existsByUserId(Long userId);
}
