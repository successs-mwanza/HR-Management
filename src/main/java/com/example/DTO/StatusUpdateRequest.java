package com.example.DTO;

public class StatusUpdateRequest {
    private String date;
    private String status;
    private String reason;
    
    // ===== Constructors =====
    public StatusUpdateRequest() {
    }
    
    public StatusUpdateRequest(String date, String status, String reason) {
        this.date = date;
        this.status = status;
        this.reason = reason;
    }
    
    // ===== Getters =====
    public String getDate() {
        return date;
    }
    
    public String getStatus() {
        return status;
    }
    
    public String getReason() {
        return reason;
    }
    
    // ===== Setters =====
    public void setDate(String date) {
        this.date = date;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}