package com.example.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.Attendance;
import com.example.Entity.AttendanceStatus;
import com.example.Entity.Employee;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // Find by date
    List<Attendance> findByDate(LocalDate date);
    
    // Find by employee and date
    Optional<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    
    // Find by date and status
    List<Attendance> findByDateAndStatus(LocalDate date, AttendanceStatus status);
    
    // Find by date range
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find by employee and date range
    List<Attendance> findByEmployeeAndDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);
    
    // Find by date and employee department
    List<Attendance> findByDateAndEmployeeDepartment(LocalDate date, String department);
    
    // Find by date, status, and employee department
    List<Attendance> findByDateAndStatusAndEmployeeDepartment(LocalDate date, AttendanceStatus status, String department);
    
    // Count by date and status
    long countByDateAndStatus(LocalDate date, AttendanceStatus status);
    
    // Count by date and employee department
    long countByDateAndEmployeeDepartment(LocalDate date, String department);
    
    // Count by date, status, and employee department
    long countByDateAndStatusAndEmployeeDepartment(LocalDate date, AttendanceStatus status, String department);
}