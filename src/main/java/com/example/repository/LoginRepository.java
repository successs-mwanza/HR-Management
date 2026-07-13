package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

// import com.example.Entity.Login;
import com.example.Entity.SignUp;

public interface LoginRepository  extends JpaRepository<SignUp,Long>{
    SignUp findByEmail(String email);
    
}
