package com.example.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName; // store fname
    private String middleName;// store mname
    private String lastName;    // store lname
 //constructor, getters and setters
    public Employee() {
    }
    public Employee(String firstName, String middleName, String lastName) {
        this.firstName = firstName; // this will store the value of fname in firstName variable
        this.middleName = middleName; // this will store the value of mname in middleName variable
        this.lastName = lastName; // this will store the value of lname in lastName variable
    }
    public Long getId() {
        return id;
    }
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }
//
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}