package com.example.energygridcompositionservice.repository;

import com.example.energygridcompositionservice.entity.Busbar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusbarRepository extends JpaRepository<Busbar, Long> {
}