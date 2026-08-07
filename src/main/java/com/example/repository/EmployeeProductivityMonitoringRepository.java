package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.EmployeeProductivityMonitoringEntry;


@Repository
public interface EmployeeProductivityMonitoringRepository extends JpaRepository<EmployeeProductivityMonitoringEntry, Long> {
    List<EmployeeProductivityMonitoringEntry> findAllByOrderByDateAsc();

}
