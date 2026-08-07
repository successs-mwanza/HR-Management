package com.example.services;

import com.example.Entity.LeaveManagement;
import com.example.repository.LeaveManagementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveManagementService {

    @Autowired
    private LeaveManagementRepository leaveManagementRepository;

    /**
     * Create a new leave management record
     */
    @Transactional
    public LeaveManagement createLeaveRecord(LeaveManagement leaveManagement) {
        populateStatusCounts(leaveManagement);
        validateLeaveRecord(leaveManagement);
        return leaveManagementRepository.save(leaveManagement);
    }

    /**
     * Get all leave management records
     */
    public List<LeaveManagement> getAllLeaveRecords() {
        return leaveManagementRepository.findAll();
    }

    /**
     * Get leave record by ID
     */
    public Optional<LeaveManagement> getLeaveRecordById(Long id) {
        return leaveManagementRepository.findById(id);
    }

    /**
     * Update leave record
     */
    @Transactional
    public LeaveManagement updateLeaveRecord(Long id, LeaveManagement leaveManagement) {
        LeaveManagement existingRecord = leaveManagementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave record not found with id: " + id));
        
        existingRecord.setEmployeeName(leaveManagement.getEmployeeName());
        existingRecord.setDepartment(leaveManagement.getDepartment());
        existingRecord.setLeaveType(leaveManagement.getLeaveType());
        existingRecord.setStartDate(leaveManagement.getStartDate());
        existingRecord.setEndDate(leaveManagement.getEndDate());
        existingRecord.setStatus(leaveManagement.getStatus());
        existingRecord.setReason(leaveManagement.getReason());
        existingRecord.setAppliedDate(leaveManagement.getAppliedDate());
        existingRecord.setTotalDays(leaveManagement.getTotalDays());
        
        populateStatusCounts(existingRecord);
        validateLeaveRecord(existingRecord);
        
        return leaveManagementRepository.save(existingRecord);
    }

    /**
     * Delete leave record
     */
    @Transactional
    public void deleteLeaveRecord(Long id) {
        if (!leaveManagementRepository.existsById(id)) {
            throw new RuntimeException("Leave record not found with id: " + id);
        }
        leaveManagementRepository.deleteById(id);
    }

    /**
     * Get total leave requests
     */
    public Integer getTotalLeaveRequests() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .mapToInt(LeaveManagement::getTotalRequest)
            .sum();
    }

    /**
     * Get total approved leaves
     */
    public Integer getTotalApprovedLeaves() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getApproved()))
            .sum();
    }

    /**
     * Get total pending leaves
     */
    public Integer getTotalPendingLeaves() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getPending()))
            .sum();
    }

    /**
     * Get total rejected leaves
     */
    public Integer getTotalRejectedLeaves() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getRejected()))
            .sum();
    }

    /**
     * Get leave statistics summary
     */
    public LeaveStatistics getLeaveStatistics() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        
        int totalRequests = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalRequest)
            .sum();
        
        int totalApproved = allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getApproved()))
            .sum();
        
        int totalPending = allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getPending()))
            .sum();
        
        int totalRejected = allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getRejected()))
            .sum();
        
        int totalDays = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalDays)
            .sum();
        
        return new LeaveStatistics(totalRequests, totalApproved, totalPending, totalRejected, totalDays);
    }

    /**
     * Get approval rate
     */
    public double getApprovalRate() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        int totalRequests = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalRequest)
            .sum();
        
        if (totalRequests == 0) {
            return 0.0;
        }
        
        int totalApproved = allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getApproved()))
            .sum();
        
        return (double) totalApproved / totalRequests * 100;
    }

    /**
     * Get rejection rate
     */
    public double getRejectionRate() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        int totalRequests = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalRequest)
            .sum();
        
        if (totalRequests == 0) {
            return 0.0;
        }
        
        int totalRejected = allRecords.stream()
            .mapToInt(record -> Integer.parseInt(record.getRejected()))
            .sum();
        
        return (double) totalRejected / totalRequests * 100;
    }

    /**
     * Get average days per request
     */
    public double getAverageDaysPerRequest() {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        int totalRequests = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalRequest)
            .sum();
        
        if (totalRequests == 0) {
            return 0.0;
        }
        
        int totalDays = allRecords.stream()
            .mapToInt(LeaveManagement::getTotalDays)
            .sum();
        
        return (double) totalDays / totalRequests;
    }

    /**
     * Update leave counts when a request is approved
     */
    @Transactional
    public void processApprovedLeave(Long recordId, int days) {
        LeaveManagement record = leaveManagementRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Leave record not found"));

        record.setStatus("Approved");
        record.setApproved("1");
        record.setPending("0");
        record.setRejected("0");
        record.setTotalDays(days > 0 ? days : record.getTotalDays());
        record.setTotalRequest(1);

        leaveManagementRepository.save(record);
    }

    /**
     * Update leave counts when a request is rejected
     */
    @Transactional
    public void processRejectedLeave(Long recordId) {
        LeaveManagement record = leaveManagementRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Leave record not found"));

        record.setStatus("Rejected");
        record.setApproved("0");
        record.setPending("0");
        record.setRejected("1");
        record.setTotalRequest(1);

        leaveManagementRepository.save(record);
    }

    /**
     * Add a new pending leave request
     */
    @Transactional
    public void addPendingLeave(Long recordId, int days) {
        LeaveManagement record = leaveManagementRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Leave record not found"));

        record.setStatus("Pending");
        record.setApproved("0");
        record.setPending("1");
        record.setRejected("0");
        record.setTotalDays(days > 0 ? days : record.getTotalDays());
        record.setTotalRequest(1);

        leaveManagementRepository.save(record);
    }

    /**
     * Reset leave counters (for new year or period)
     */
    @Transactional
    public void resetLeaveCounters(Long recordId) {
        LeaveManagement record = leaveManagementRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Leave record not found"));
        
        record.setApproved("0");
        record.setPending("0");
        record.setRejected("0");
        record.setTotalDays(0);
        record.setTotalRequest(0);
        
        leaveManagementRepository.save(record);
    }

    /**
     * Get records with high pending count
     */
    public List<LeaveManagement> getRecordsWithHighPending(int threshold) {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .filter(record -> Integer.parseInt(record.getPending()) > threshold)
            .toList();
    }

    /**
     * Get records with high approval rate
     */
    public List<LeaveManagement> getRecordsWithHighApprovalRate(double threshold) {
        List<LeaveManagement> allRecords = leaveManagementRepository.findAll();
        return allRecords.stream()
            .filter(record -> {
                int totalRequests = record.getTotalRequest();
                if (totalRequests == 0) return false;
                int approved = Integer.parseInt(record.getApproved());
                double rate = (double) approved / totalRequests * 100;
                return rate >= threshold;
            })
            .toList();
    }

    // Private validation method
    private void validateLeaveRecord(LeaveManagement leaveManagement) {
        if (leaveManagement.getEmployeeName() == null || leaveManagement.getEmployeeName().isEmpty()) {
            throw new IllegalArgumentException("Employee name cannot be null or empty");
        }

        if (leaveManagement.getDepartment() == null || leaveManagement.getDepartment().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be null or empty");
        }

        if (leaveManagement.getLeaveType() == null || leaveManagement.getLeaveType().isEmpty()) {
            throw new IllegalArgumentException("Leave type cannot be null or empty");
        }

        if (leaveManagement.getStartDate() == null || leaveManagement.getStartDate().isEmpty()) {
            throw new IllegalArgumentException("Start date cannot be null or empty");
        }

        if (leaveManagement.getEndDate() == null || leaveManagement.getEndDate().isEmpty()) {
            throw new IllegalArgumentException("End date cannot be null or empty");
        }

        if (leaveManagement.getStatus() == null || leaveManagement.getStatus().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }

        if (leaveManagement.getReason() == null || leaveManagement.getReason().isEmpty()) {
            throw new IllegalArgumentException("Reason cannot be null or empty");
        }

        if (leaveManagement.getAppliedDate() == null || leaveManagement.getAppliedDate().isEmpty()) {
            throw new IllegalArgumentException("Applied date cannot be null or empty");
        }

        if (leaveManagement.getTotalDays() == null || leaveManagement.getTotalDays() < 0) {
            throw new IllegalArgumentException("Total days must be a non-negative number");
        }

        if (leaveManagement.getTotalRequest() == null || leaveManagement.getTotalRequest() < 0) {
            throw new IllegalArgumentException("Total request must be a non-negative number");
        }

        // Validate that counts are valid integers
        try {
            Integer.parseInt(leaveManagement.getApproved());
            Integer.parseInt(leaveManagement.getPending());
            Integer.parseInt(leaveManagement.getRejected());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Approved, pending, and rejected must be valid numbers");
        }
    }

    private void populateStatusCounts(LeaveManagement leaveManagement) {
        String status = leaveManagement.getStatus();
        if (status == null || status.isEmpty()) {
            status = "Pending";
            leaveManagement.setStatus(status);
        }

        if (status.equalsIgnoreCase("Approved")) {
            leaveManagement.setApproved("1");
            leaveManagement.setPending("0");
            leaveManagement.setRejected("0");
        } else if (status.equalsIgnoreCase("Rejected")) {
            leaveManagement.setApproved("0");
            leaveManagement.setPending("0");
            leaveManagement.setRejected("1");
        } else {
            leaveManagement.setApproved("0");
            leaveManagement.setPending("1");
            leaveManagement.setRejected("0");
            leaveManagement.setStatus("Pending");
        }

        if (leaveManagement.getTotalRequest() == null || leaveManagement.getTotalRequest() < 1) {
            leaveManagement.setTotalRequest(1);
        }
    }

    // Inner class for statistics
    public static class LeaveStatistics {
        private final int totalRequests;
        private final int totalApproved;
        private final int totalPending;
        private final int totalRejected;
        private final int totalDays;
        private final double approvalRate;
        private final double rejectionRate;
        private final double averageDaysPerRequest;

        public LeaveStatistics(int totalRequests, int totalApproved, int totalPending, 
                              int totalRejected, int totalDays) {
            this.totalRequests = totalRequests;
            this.totalApproved = totalApproved;
            this.totalPending = totalPending;
            this.totalRejected = totalRejected;
            this.totalDays = totalDays;
            this.approvalRate = totalRequests > 0 ? (double) totalApproved / totalRequests * 100 : 0.0;
            this.rejectionRate = totalRequests > 0 ? (double) totalRejected / totalRequests * 100 : 0.0;
            this.averageDaysPerRequest = totalRequests > 0 ? (double) totalDays / totalRequests : 0.0;
        }

        // Getters
        public int getTotalRequests() { return totalRequests; }
        public int getTotalApproved() { return totalApproved; }
        public int getTotalPending() { return totalPending; }
        public int getTotalRejected() { return totalRejected; }
        public int getTotalDays() { return totalDays; }
        public double getApprovalRate() { return approvalRate; }
        public double getRejectionRate() { return rejectionRate; }
        public double getAverageDaysPerRequest() { return averageDaysPerRequest; }

        @Override
        public String toString() {
            return String.format(
                "LeaveStatistics{totalRequests=%d, totalApproved=%d, totalPending=%d, " +
                "totalRejected=%d, totalDays=%d, approvalRate=%.2f%%, rejectionRate=%.2f%%, " +
                "averageDaysPerRequest=%.2f}",
                totalRequests, totalApproved, totalPending, totalRejected, totalDays,
                approvalRate, rejectionRate, averageDaysPerRequest
            );
        }
    }
}