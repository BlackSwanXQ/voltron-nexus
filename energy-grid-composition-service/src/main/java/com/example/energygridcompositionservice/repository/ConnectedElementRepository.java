package com.example.energygridcompositionservice.repository;

import com.example.energygridcompositionservice.entity.ConnectedElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConnectedElementRepository extends JpaRepository<ConnectedElement,Long> {

}
