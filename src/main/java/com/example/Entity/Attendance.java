package com.example.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "date"}))
public class Attendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "check_in")
    private LocalDateTime checkIn;
    
    @Column(name = "check_out")
    private LocalDateTime checkOut;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.PRESENT;
    
    @Column(name = "check_in_location")
    private String checkInLocation;
    
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ===== Constructors =====
    public Attendance() {
    }
    
    public Attendance(Long id, Employee employee, LocalDate date, LocalDateTime checkIn, 
                      LocalDateTime checkOut, AttendanceStatus status, String checkInLocation, 
                      String location, String reason, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.employee = employee;
        this.date = date;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status;
        this.checkInLocation = checkInLocation;
        this.location = location;
        this.reason = reason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // ===== Getters =====
    public Long getId() {
        return id;
    }
    
    public Employee getEmployee() {
        return employee;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public LocalDateTime getCheckIn() {
        return checkIn;
    }
    
    public LocalDateTime getCheckOut() {
        return checkOut;
    }
    
    public AttendanceStatus getStatus() {
        return status;
    }
    
    public String getCheckInLocation() {
        return checkInLocation;
    }
    
    public String getLocation() {
        return location;
    }
    
    public String getReason() {
        return reason;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    // ===== Setters =====
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setEmployee(Employee employee) {
        this.employee = employee;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }
    
    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }
    
    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
    
    public void setCheckInLocation(String checkInLocation) {
        this.checkInLocation = checkInLocation;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}