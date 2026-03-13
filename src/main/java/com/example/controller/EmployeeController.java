package com.example.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Model.Employee;
import com.example.repository.EmployeeRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class EmployeeController {

   @Autowired
private EmployeeRepository employeeRepository;
// this api is responsible for fetching all the employees from the database
@GetMapping("/employees")
public List<Employee> getAllEmployees(){
    return employeeRepository.findAll();
}
// this api is responsible for fetching a single employee by id from the database
@GetMapping("/employees/{id}")
public Employee getEmployeeById(@PathVariable Long id){
    return employeeRepository.findById(id).orElse(null);
}
// this api is responsible for creating a new employee in the database
@PostMapping("/employees")
public Employee createEmployee(@RequestBody Employee employee){
    return employeeRepository.save(employee);
}
// this api is responsible for updating an employee in the database
@PutMapping("/employees/{id}")
public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee){
    return employeeRepository.findById(id).map(emp -> {
        emp.setFirstName(employee.getFirstName());
        emp.setMiddleName(employee.getMiddleName());
        emp.setLastName(employee.getLastName());
        return employeeRepository.save(emp);
    }).orElse(null);
}
// this api is responsible for deleting an employee from the database
@DeleteMapping("/employees/{id}")
public void deleteEmployee(@PathVariable Long id){
    employeeRepository.deleteById(id);
}
}