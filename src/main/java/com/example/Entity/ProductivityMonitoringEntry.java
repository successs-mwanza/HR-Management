package com.example.Entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "productivitymonitoring")
public class ProductivityMonitoringEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private double hoursWorked;

    @Column(nullable = false)
    private int goalsAssigned;

    @Column(nullable = false)
    private int goalsCompleted;

    private int timeSpent;

    @Column(nullable = false)
    private int qualityScore;

    private int productivityRate;

    @Column(length = 1000)
    private String notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(double hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public int getGoalsAssigned() {
        return goalsAssigned;
    }

    public void setGoalsAssigned(int goalsAssigned) {
        this.goalsAssigned = goalsAssigned;
    }

    public int getGoalsCompleted() {
        return goalsCompleted;
    }

    public void setGoalsCompleted(int goalsCompleted) {
        this.goalsCompleted = goalsCompleted;
    }

    public int getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }

    public int getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }

    public int getProductivityRate() {
        return productivityRate;
    }

    public void setProductivityRate(int productivityRate) {
        this.productivityRate = productivityRate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
