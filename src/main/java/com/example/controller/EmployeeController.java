package com.example.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Model.Employee;
import com.example.repository.EmployeeRepository;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000/")
@RestController
@RequestMapping("/api")
public class EmployeeController {

   @Autowired
private EmployeeRepository employeeRepository;

@GetMapping("/employees")
public List<Employee> getAllEmployees(){
    return employeeRepository.findAll();
}

@GetMapping("/employees/{id}")
public Employee getEmployeeById(@PathVariable Long id){
    return employeeRepository.findById(id).orElse(null);
}
}