package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.EmployeeProductivityMonitoringEntry;

import com.example.services.EmployeeProductivityMonitoringService;


@RestController
@RequestMapping("/api/employeeproductivity")
@CrossOrigin(origins = "http://192.168.122.13122.13122.13122.131:3000")
public class EmployeeProductivityMonitoringController {

    @Autowired
    private EmployeeProductivityMonitoringService service;

    @GetMapping
    public ResponseEntity<List<EmployeeProductivityMonitoringEntry>> getAllEntries() {
        return ResponseEntity.ok(service.getAllEntries());
    }

    @PostMapping
    public ResponseEntity<EmployeeProductivityMonitoringEntry> createEntry(@RequestBody EmployeeProductivityMonitoringEntry entry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createEntry(entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeProductivityMonitoringEntry> updateEntry(@PathVariable Long id,
            @RequestBody EmployeeProductivityMonitoringEntry entry) {
        return ResponseEntity.ok(service.updateEntry(id, entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

}
