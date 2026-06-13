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
    private String department; // store department
    private String email; // store email
    private String phone; // store phone
    private String position; // store position
    private Boolean status; // store status
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
    public String getdepartment(){
        return department;
    }
    public void setdepartment(String daprtment){
        this.department=department;
    }
    public String getemail(){
        return email;
    }
    public void setemail(String email){
        this.email=email;
    } 
    public String getphone(){
        return phone;
    }
    public void setphone(String phone){
        this.phone=phone;
    }
    public String getposition(){
        return position;
    }
    public void setposition(String position){
        this.position=position;
    }
public Boolean getstatus(){
    return status;
}      
public void setstatus (boolean status){
    this.status=status;
}
}