package com.example.energygridcompositionservice.repository;

import com.example.energygridcompositionservice.entity.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransformerRepository extends JpaRepository<Transformer, Long> {
}