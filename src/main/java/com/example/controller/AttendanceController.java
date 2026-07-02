package com.example.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.AttendanceRequest;
import com.example.DTO.AttendanceStatsDTO;
import com.example.DTO.StatusUpdateRequest;
import com.example.Model.Attendance;
import com.example.services.AttendanceService;

import jakarta.validation.Valid;



@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }
    
    @GetMapping("/filtered") 
    public ResponseEntity<List<Attendance>> getFilteredAttendance(
            @RequestParam String date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(attendanceService.getFilteredAttendance(date, status, department));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<AttendanceStatsDTO> getAttendanceStats(
            @RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceStats(date));
    }
    
    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.checkIn(request));
    }
    
    @PutMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.checkOut(request));
    }
    
    @PutMapping("/{employeeId}/status")
    public ResponseEntity<Attendance> updateStatus(
            @PathVariable Long employeeId,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(attendanceService.updateStatus(employeeId, request));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId, startDate, endDate));
    }
}