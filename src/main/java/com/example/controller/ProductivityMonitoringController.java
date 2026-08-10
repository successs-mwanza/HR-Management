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

import com.example.Entity.ProductivityMonitoringEntry;
import com.example.services.ProductivityMonitoringService;

@RestController
@RequestMapping("/api/productivity-monitoring")
@CrossOrigin(origins = "http://192.168.122.131:3000")
public class ProductivityMonitoringController {

    @Autowired
    private ProductivityMonitoringService service;

    @GetMapping
    public ResponseEntity<List<ProductivityMonitoringEntry>> getAllEntries() {
        return ResponseEntity.ok(service.getAllEntries());
    }

    @PostMapping
    public ResponseEntity<ProductivityMonitoringEntry> createEntry(@RequestBody ProductivityMonitoringEntry entry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createEntry(entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductivityMonitoringEntry> updateEntry(@PathVariable Long id,
            @RequestBody ProductivityMonitoringEntry entry) {
        return ResponseEntity.ok(service.updateEntry(id, entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
