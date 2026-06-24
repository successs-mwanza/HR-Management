package com.example.DTO;

public class AttendanceStatsDTO {
    private long present;
    private long absent;
    private long late;
    private long onLeave;
    private long total;
    private double attendanceRate;
    
    // ===== Constructors =====
    public AttendanceStatsDTO() {
    }
    
    public AttendanceStatsDTO(long present, long absent, long late, long onLeave, 
                              long total, double attendanceRate) {
        this.present = present;
        this.absent = absent;
        this.late = late;
        this.onLeave = onLeave;
        this.total = total;
        this.attendanceRate = attendanceRate;
    }
    
    // ===== Getters =====
    public long getPresent() {
        return present;
    }
    
    public long getAbsent() {
        return absent;
    }
    
    public long getLate() {
        return late;
    }
    
    public long getOnLeave() {
        return onLeave;
    }
    
    public long getTotal() {
        return total;
    }
    
    public double getAttendanceRate() {
        return attendanceRate;
    }
    
    // ===== Setters =====
    public void setPresent(long present) {
        this.present = present;
    }
    
    public void setAbsent(long absent) {
        this.absent = absent;
    }
    
    public void setLate(long late) {
        this.late = late;
    }
    
    public void setOnLeave(long onLeave) {
        this.onLeave = onLeave;
    }
    
    public void setTotal(long total) {
        this.total = total;
    }
    
    public void setAttendanceRate(double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}