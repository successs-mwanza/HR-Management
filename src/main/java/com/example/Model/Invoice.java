package com.example.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String invoiceNumber;
    private String date;
    private String dueDate;
    private String sellerInfo;
    private String buyerInfo;
    private String paymentTerms;
    private double tax;
    private double subtotal;
    private double totalAmount;
    private String notes;

    public Invoice() {}

    // Getters and Setters
    public long getId() { return id; }   
    public void setId(long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getSellerInfo() { return sellerInfo; }
    public void setSellerInfo(String sellerInfo) { this.sellerInfo = sellerInfo; }

    public String getBuyerInfo() { return buyerInfo; }
    public void setBuyerInfo(String buyerInfo) { this.buyerInfo = buyerInfo; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}