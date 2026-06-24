package com.example.DTO;

import jakarta.validation.constraints.NotNull;

public class AttendanceRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private String checkIn;
    private String checkOut;
    
    @NotNull(message = "Date is required")
    private String date;
    
    private String location;
    private String status;
    private String reason;
    
    // ===== Constructors =====
    public AttendanceRequest() {
    }
    
    public AttendanceRequest(Long employeeId, String checkIn, String checkOut, 
                            String date, String location, String status, String reason) {
        this.employeeId = employeeId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.date = date;
        this.location = location;
        this.status = status;
        this.reason = reason;
    }
    
    // ===== Getters =====
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public String getCheckIn() {
        return checkIn;
    }
    
    public String getCheckOut() {
        return checkOut;
    }
    
    public String getDate() {
        return date;
    }
    
    public String getLocation() {
        return location;
    }
    
    public String getStatus() {
        return status;
    }
    
    public String getReason() {
        return reason;
    }
    
    // ===== Setters =====
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public void setCheckIn(String checkIn) {
        this.checkIn = checkIn;
    }
    
    public void setCheckOut(String checkOut) {
        this.checkOut = checkOut;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}