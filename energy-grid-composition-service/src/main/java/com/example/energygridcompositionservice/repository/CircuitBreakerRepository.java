package com.example.energygridcompositionservice.repository;

import com.example.energygridcompositionservice.entity.CircuitBreaker;
import com.example.energygridcompositionservice.entity.ConnectedElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CircuitBreakerRepository extends JpaRepository<CircuitBreaker, Long> {

    @Query("SELECT cb FROM CircuitBreaker cb WHERE cb.elementA = :element OR cb.elementB = :element")
    List<CircuitBreaker> findByPowerElement(@Param("element") ConnectedElement element);

    @Query("SELECT cb FROM CircuitBreaker cb WHERE " +
            "(cb.elementA = :elem1 AND cb.elementB = :elem2) OR " +
            "(cb.elementA = :elem2 AND cb.elementB = :elem1)")
    Optional<CircuitBreaker> findConnectionBetween(@Param("elem1") ConnectedElement elem1,
                                                   @Param("elem2") ConnectedElement elem2);
}