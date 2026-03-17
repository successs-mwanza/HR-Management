package com.example.repository;

import com.example.Model.Income_Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeExpenseRepository extends JpaRepository<Income_Expense, Long> {
    
}
