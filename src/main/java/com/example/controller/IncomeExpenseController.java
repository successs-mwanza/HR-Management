package com.example.controller;

import com.example.Model.Income_Expense;
import com.example.repository.IncomeExpenseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/income-expenses")
@CrossOrigin(origins = "*", maxAge = 3600)
public class IncomeExpenseController {
    
    @Autowired
    private IncomeExpenseRepository incomeExpenseRepository;
    
    // Get all transactions
    @GetMapping
    public ResponseEntity<List<Income_Expense>> getAllTransactions() {
        try {
            List<Income_Expense> transactions = incomeExpenseRepository.findAll();
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get transaction by ID
    @GetMapping("/{id}")
    public ResponseEntity<Income_Expense> getTransactionById(@PathVariable Long id) {
        try {
            Optional<Income_Expense> transaction = incomeExpenseRepository.findById(id);
            if (transaction.isPresent()) {
                return ResponseEntity.ok(transaction.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Create new transaction
    @PostMapping
    public ResponseEntity<Income_Expense> createTransaction(@RequestBody Income_Expense transaction) {
        try {
            if (transaction.getType() == null || transaction.getType().isEmpty() ||
                transaction.getCategory() == null || transaction.getCategory().isEmpty() ||
                transaction.getAmount() == null || transaction.getDate() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Income_Expense savedTransaction = incomeExpenseRepository.save(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update transaction
    @PutMapping("/{id}")
    public ResponseEntity<Income_Expense> updateTransaction(@PathVariable Long id, @RequestBody Income_Expense transactionDetails) {
        try {
            Optional<Income_Expense> transaction = incomeExpenseRepository.findById(id);
            if (transaction.isPresent()) {
                Income_Expense trans = transaction.get();
                if (transactionDetails.getType() != null) {
                    trans.setType(transactionDetails.getType());
                }
                if (transactionDetails.getCategory() != null) {
                    trans.setCategory(transactionDetails.getCategory());
                }
                if (transactionDetails.getAmount() != null) {
                    trans.setAmount(transactionDetails.getAmount());
                }
                if (transactionDetails.getDescription() != null) {
                    trans.setDescription(transactionDetails.getDescription());
                }
                if (transactionDetails.getDate() != null) {
                    trans.setDate(transactionDetails.getDate());
                }
                
                Income_Expense updatedTransaction = incomeExpenseRepository.save(trans);
                return ResponseEntity.ok(updatedTransaction);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        try {
            if (incomeExpenseRepository.existsById(id)) {
                incomeExpenseRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
