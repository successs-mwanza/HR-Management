package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Model.Invoice;
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

  
    
}
