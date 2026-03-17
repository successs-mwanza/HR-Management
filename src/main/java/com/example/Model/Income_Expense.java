package com.example.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Income_Expense {  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  
    private String type;  
    private String category;
    private Double amount;  
    private String description;  
    private String date;
     
    // Constructors
    public Income_Expense() {
    }
    
    public Income_Expense(String type, String category, Double amount, String description, String date) {
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.date = date;
    }
    
    // Getters and Setters  
    public Long getId() {  
        return id;  
    }  
  
    public void setId(Long id) {  
        this.id = id;  
    }  
  
    public String getType() {  
        return type;  
    }  
  
    public void setType(String type) {  
        this.type = type;  
    }  
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
  
    public Double getAmount() {  
        return amount;  
    }  
  
    public void setAmount(Double amount) {  
        this.amount = amount;  
    }  
  
    public String getDescription() {  
        return description;  
    }  
  
    public void setDescription(String description) {  
        this.description = description;  
    }  
  
    public String getDate() {  
        return date;  
    }  
  
    public void setDate(String date) {  
        this.date = date;  
    }


    // public String getAction() {  
    //     return action;  
    // }   
    // public void setAction(String action) {  
    //     this.action = action;  
    // }
     
    
}
