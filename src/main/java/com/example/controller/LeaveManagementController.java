package com.example.controller;

import com.example.Entity.LeaveManagement;
import com.example.services.LeaveManagementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/leave-management")
public class LeaveManagementController {

    @Autowired
    private LeaveManagementService leaveManagementService;

    @PostMapping
    public ResponseEntity<LeaveManagement> createLeaveRecord(@RequestBody LeaveManagement leaveManagement) {
        return new ResponseEntity<>(leaveManagementService.createLeaveRecord(leaveManagement), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LeaveManagement>> getAllLeaveRecords() {
        return ResponseEntity.ok(leaveManagementService.getAllLeaveRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveManagement> getLeaveRecordById(@PathVariable Long id) {
        return leaveManagementService.getLeaveRecordById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveManagement> updateLeaveRecord(@PathVariable Long id, 
                                                            @RequestBody LeaveManagement leaveManagement) {
        return ResponseEntity.ok(leaveManagementService.updateLeaveRecord(id, leaveManagement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRecord(@PathVariable Long id) {
        leaveManagementService.deleteLeaveRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<LeaveManagementService.LeaveStatistics> getLeaveStatistics() {
        return ResponseEntity.ok(leaveManagementService.getLeaveStatistics());
    }

    @GetMapping("/approval-rate")
    public ResponseEntity<Double> getApprovalRate() {
        return ResponseEntity.ok(leaveManagementService.getApprovalRate());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveLeave(@PathVariable Long id, @RequestParam int days) {
        leaveManagementService.processApprovedLeave(id, days);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectLeave(@PathVariable Long id) {
        leaveManagementService.processRejectedLeave(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/pending")
    public ResponseEntity<Void> addPendingLeave(@PathVariable Long id, @RequestParam int days) {
        leaveManagementService.addPendingLeave(id, days);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<Void> resetCounters(@PathVariable Long id) {
        leaveManagementService.resetLeaveCounters(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/high-pending")
    public ResponseEntity<List<LeaveManagement>> getHighPendingRecords(@RequestParam int threshold) {
        return ResponseEntity.ok(leaveManagementService.getRecordsWithHighPending(threshold));
    }
}