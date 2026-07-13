package com.example.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity 
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double basicSalary;
    private double allowances;
    private double deductions;
    private double netSalary;
    
    public Payroll() {
    }
    
    // Getters and setters...
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public double getBasicSalary() {
        return basicSalary;
    }
    
    public void setBasicSalary(double basicSalary) {
        this.basicSalary = basicSalary;
    }
    
    public double getAllowances() {
        return allowances;
    }
    
    public void setAllowances(double allowances) {
        this.allowances = allowances;
    }
    
    public double getDeductions() {
        return deductions;
    }
    
    public void setDeductions(double deductions) {
        this.deductions = deductions;
    }
    
    public double getNetSalary() {
        return netSalary;
    }
    
    public void setNetSalary(double netSalary) {
        this.netSalary = netSalary;
    }
}