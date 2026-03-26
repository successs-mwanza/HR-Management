package com.example.services;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class InvoiceNumberGenerator {

    public String generateInvoiceNumber() {
        // Simple random number generator (you can customize format)
        int number = 100000 + new Random().nextInt(900000);
        return "INV-" + number;
    }
}