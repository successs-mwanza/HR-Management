package com.example.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DTO.AttendanceRequest;
import com.example.DTO.AttendanceStatsDTO;
import com.example.DTO.StatusUpdateRequest;
import com.example.Entity.Attendance;
import com.example.Entity.AttendanceStatus;
import com.example.Entity.Employee;
import com.example.repository.AttendanceRepository;
import com.example.repository.EmployeeRepository;

@Service
@Transactional
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;
    
    // Get attendance by date
    public List<Attendance> getAttendanceByDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
        return attendanceRepository.findByDate(date);
    }
    
    // Get filtered attendance
    public List<Attendance> getFilteredAttendance(String dateStr, String status, String department) {
        LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
        
        // If no filters, return all attendance for the date
        if ((status == null || "all".equals(status)) && (department == null || "all".equals(department))) {
            return attendanceRepository.findByDate(date);
        }
        
        // If only status filter
        if (status != null && !"all".equals(status) && (department == null || "all".equals(department))) {
            AttendanceStatus attendanceStatus = AttendanceStatus.fromValue(status);
            return attendanceRepository.findByDateAndStatus(date, attendanceStatus);
        }
        
        // If only department filter
        if ((status == null || "all".equals(status)) && department != null && !"all".equals(department)) {
            return attendanceRepository.findByDateAndEmployeeDepartment(date, department);
        }
        
        // If both filters
        if (status != null && !"all".equals(status) && department != null && !"all".equals(department)) {
            AttendanceStatus attendanceStatus = AttendanceStatus.fromValue(status);
            return attendanceRepository.findByDateAndStatusAndEmployeeDepartment(date, attendanceStatus, department);
        }
        
        return attendanceRepository.findByDate(date);
    }
    
    // Get attendance stats
    public AttendanceStatsDTO getAttendanceStats(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
        
        long present = attendanceRepository.countByDateAndStatus(date, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByDateAndStatus(date, AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByDateAndStatus(date, AttendanceStatus.LATE);
        long onLeave = attendanceRepository.countByDateAndStatus(date, AttendanceStatus.ON_LEAVE);
        long total = present + absent + late + onLeave;
        
        double attendanceRate = total > 0 ? ((present + late) * 100.0 / total) : 0;
        
        AttendanceStatsDTO stats = new AttendanceStatsDTO();
        stats.setPresent(present);
        stats.setAbsent(absent);
        stats.setLate(late);
        stats.setOnLeave(onLeave);
        stats.setTotal(total);
        stats.setAttendanceRate(attendanceRate);
        
        return stats;
    }
    
    // Check in
    public Attendance checkIn(AttendanceRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        LocalDate date = LocalDate.parse(request.getDate(), DATE_FORMATTER);
        LocalDateTime checkInTime = LocalDateTime.parse(request.getCheckIn(), DATETIME_FORMATTER);
        
        // Check if attendance exists
        Attendance attendance = attendanceRepository
                .findByEmployeeAndDate(employee, date)
                .orElseGet(() -> {
                    Attendance newAttendance = new Attendance();
                    newAttendance.setEmployee(employee);
                    newAttendance.setDate(date);
                    return newAttendance;
                });
        
        if (attendance.getCheckIn() != null) {
            throw new RuntimeException("Employee already checked in today");
        }
        
        attendance.setCheckIn(checkInTime);
        attendance.setCheckInLocation(request.getLocation() != null ? request.getLocation() : "Office");
        
        // Determine if late (after 9:30 AM)
        LocalDateTime nineThirty = LocalDateTime.of(date, java.time.LocalTime.of(9, 30));
        if (checkInTime.isAfter(nineThirty)) {
            attendance.setStatus(AttendanceStatus.LATE);
        } else {
            attendance.setStatus(AttendanceStatus.PRESENT);
        }
        
        return attendanceRepository.save(attendance);
    }
    
    // Check out
    public Attendance checkOut(AttendanceRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        LocalDate date = LocalDate.parse(request.getDate(), DATE_FORMATTER);
        LocalDateTime checkOutTime = LocalDateTime.parse(request.getCheckOut(), DATETIME_FORMATTER);
        
        Attendance attendance = attendanceRepository
                .findByEmployeeAndDate(employee, date)
                .orElseThrow(() -> new RuntimeException("No check-in record found for today"));
        
        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Employee already checked out");
        }
        
        attendance.setCheckOut(checkOutTime);
        
        return attendanceRepository.save(attendance);
    }
    
    // Update status
    public Attendance updateStatus(Long employeeId, StatusUpdateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        LocalDate date = LocalDate.parse(request.getDate(), DATE_FORMATTER);
        AttendanceStatus status = AttendanceStatus.fromValue(request.getStatus());
        
        Attendance attendance = attendanceRepository
                .findByEmployeeAndDate(employee, date)
                .orElseGet(() -> {
                    Attendance newAttendance = new Attendance();
                    newAttendance.setEmployee(employee);
                    newAttendance.setDate(date);
                    return newAttendance;
                });
        
        attendance.setStatus(status);
        attendance.setReason(request.getReason());
        
        return attendanceRepository.save(attendance);
    }
    
    // Get employee attendance by date range
    public List<Attendance> getEmployeeAttendance(Long employeeId, String startDateStr, String endDateStr) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        LocalDate startDate = LocalDate.parse(startDateStr, DATE_FORMATTER);
        LocalDate endDate = LocalDate.parse(endDateStr, DATE_FORMATTER);
        
        return attendanceRepository.findByEmployeeAndDateBetween(employee, startDate, endDate);
    }
}