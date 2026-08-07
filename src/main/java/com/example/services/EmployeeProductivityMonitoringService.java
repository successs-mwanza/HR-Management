package com.example.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.EmployeeProductivityMonitoringEntry;
import com.example.repository.EmployeeProductivityMonitoringRepository;

@Service
public class EmployeeProductivityMonitoringService {
    

    @Autowired
    private EmployeeProductivityMonitoringRepository repository;

    public List<EmployeeProductivityMonitoringEntry> getAllEntries() {
        return repository.findAllByOrderByDateAsc();
    }


    public EmployeeProductivityMonitoringEntry createEntry(EmployeeProductivityMonitoringEntry entry) {
        normalizeEntry(entry);
        return repository.save(entry);
    }

    public EmployeeProductivityMonitoringEntry updateEntry(Long id, EmployeeProductivityMonitoringEntry updatedEntry) {
        return repository.findById(id).map(existing -> {
            existing.setDate(updatedEntry.getDate());
            existing.setHoursWorked(updatedEntry.getHoursWorked());
            existing.setGoalsAssigned(updatedEntry.getGoalsAssigned());
            existing.setGoalsCompleted(updatedEntry.getGoalsCompleted());
            existing.setQualityScore(updatedEntry.getQualityScore());
            existing.setNotes(updatedEntry.getNotes());
            if (updatedEntry.getEmployeeName() != null) {
                existing.setEmployeeName(updatedEntry.getEmployeeName());
            }
            normalizeEntry(existing);
            return repository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Productivity entry not found"));
    }

    public void deleteEntry(Long id) {
        repository.deleteById(id);
    }

    private void normalizeEntry(EmployeeProductivityMonitoringEntry entry) {
        if (entry.getDate() == null) {
            entry.setDate(LocalDate.now());
        }

        if (entry.getGoalsAssigned() < 0) {
            entry.setGoalsAssigned(0);
        }
        if (entry.getGoalsCompleted() < 0) {
            entry.setGoalsCompleted(0);
        }
        if (entry.getGoalsCompleted() > entry.getGoalsAssigned()) {
            entry.setGoalsCompleted(entry.getGoalsAssigned());
        }

        entry.setTimeSpent((int) Math.round(entry.getHoursWorked() * 60));
        entry.setProductivityRate(entry.getGoalsAssigned() > 0 ? Math.round((entry.getGoalsCompleted() * 100f) / entry.getGoalsAssigned()): 0);
        if (entry.getQualityScore() < 0) {
            entry.setQualityScore(0);
        }
        if (entry.getQualityScore() > 100) {
            entry.setQualityScore(100);
        }
    }
}
