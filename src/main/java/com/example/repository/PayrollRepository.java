package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Entity.Payroll;
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

  
    
}
