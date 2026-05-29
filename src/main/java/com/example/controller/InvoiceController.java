package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Model.Invoice;
import com.example.repository.InvoiceRepository;
import com.example.services.InvoiceNumberGenerator;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceNumberGenerator generator;

    //  POST invoice from frontend
    @PostMapping("/invoice")
    public Invoice createInvoice(@RequestBody Invoice invoice) {

        // generate invoice number
        invoice.setInvoiceNumber(generator.generateInvoiceNumber());

        // save invoice to database
        return invoiceRepository.save(invoice);
    }
}