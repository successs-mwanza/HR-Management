package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.ProductivityMonitoringEntry;

@Repository
public interface ProductivityMonitoringRepository extends JpaRepository<ProductivityMonitoringEntry, Long> {
    List<ProductivityMonitoringEntry> findAllByOrderByDateAsc();
}
