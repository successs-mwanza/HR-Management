package com.example.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leavemanagement")
public class LeaveManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String leaveType;

    @Column(nullable = false)
    private String startDate;

    @Column(nullable = false)
    private String endDate;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String appliedDate;

    @Column(nullable = false)
    private String approved;

    @Column(nullable = false)
    private String pending;

    @Column(nullable = false)
    private String rejected;

    @Column(nullable = false)
    private Integer totalDays;

    @Column(nullable = false, name = "total_request")
    private Integer TotalRequest;

    // Getters
    public long getId() {
        return id;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public String getStatus() {
        return status;
    }

    public String getReason() {
        return reason;
    }

    public String getAppliedDate() {
        return appliedDate;
    }

    public String getApproved() {
        return approved;
    }

    public String getPending() {
        return pending;
    }

    public String getRejected() {
        return rejected;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public Integer getTotalRequest() {
        return TotalRequest;
    }

    // Setters
    public void setId(long id) {
        this.id = id;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setAppliedDate(String appliedDate) {
        this.appliedDate = appliedDate;
    }

    public void setApproved(String approved) {
        this.approved = approved;
    }

    public void setPending(String pending) {
        this.pending = pending;
    }

    public void setRejected(String rejected) {
        this.rejected = rejected;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public void setTotalRequest(Integer TotalRequest) {
        this.TotalRequest = TotalRequest;
    }
}