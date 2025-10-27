package com.example.energygridcompositionservice.repository;

import com.example.energygridcompositionservice.entity.PowerLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PowerLineRepository extends JpaRepository<PowerLine, Long> {
}