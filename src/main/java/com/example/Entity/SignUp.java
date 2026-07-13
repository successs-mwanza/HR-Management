package com.example.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class SignUp {
     
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private long id;
private String fullname;
private String email;
private String nrc;
private String password;

public SignUp() {
}
public SignUp(String  fullname, String email,String nrc,String  password , long id){
    this.fullname=fullname;
    this.nrc=nrc;
    this.email=email;
    this.password=password;
    this.id=id;
}
// getters
public String getEmail(){
    return email;
}
public String getNrc(){
    return nrc;
}
public String getFullname(){
    return fullname;
}
public String getPassword(){
    return password;
}

//setters


 public void setEmail(String email){
    this.email=email;
 }
 public void setNrc(String nrc){
    this.nrc=nrc;
 }
 public void setFullname(String fullname){
    this.fullname=fullname;
 }
 public void setPassword(String password){
    this.password=password;
 }

}
