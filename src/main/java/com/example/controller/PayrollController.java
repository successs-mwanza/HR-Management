package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Model.Payroll;  // Import your Payroll entity
import com.example.repository.PayrollRepository;

@RestController
public class PayrollController {
    @Autowired
    private PayrollRepository payrollRepository;

    @PostMapping("/payroll")
    public List<Payroll> getPayroll() {  // Changed from List<String> to List<Payroll>
        return payrollRepository.findAll();
    }
 

}