package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Entity.LeaveManagement;

public interface  LeaveManagementRepository extends JpaRepository<LeaveManagement, Long> {
    
}
