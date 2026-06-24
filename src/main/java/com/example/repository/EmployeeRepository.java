package com.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    // Find by email (since it's unique)
    Optional<Employee> findByEmail(String email);
    
    // Find by department
    List<Employee> findByDepartment(String department);
    
    // Find by status
    List<Employee> findByStatus(Boolean status);
    
    // Find by first name
    List<Employee> findByFirstName(String firstName);
    
    // Find by last name
    List<Employee> findByLastName(String lastName);
    
    // Find by first name and last name
    List<Employee> findByFirstNameAndLastName(String firstName, String lastName);
    
    // Find active employees
    List<Employee> findByStatusTrue();
    
    // Find inactive employees
    List<Employee> findByStatusFalse();
    
    // Count employees by department
    long countByDepartment(String department);
    
    // Check if email exists
    boolean existsByEmail(String email);
}