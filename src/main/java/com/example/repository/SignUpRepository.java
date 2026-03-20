package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Model.SignUp;

public interface SignUpRepository extends JpaRepository<SignUp, Long> {
  SignUp findByEmail(String email);   
}
