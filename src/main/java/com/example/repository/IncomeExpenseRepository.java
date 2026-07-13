package com.example.repository;

import com.example.Entity.Income_Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeExpenseRepository extends JpaRepository<Income_Expense, Long> {
    
}
