package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Entity.SignUp;
import com.example.repository.SignUpRepository;
import com.example.security.JwtUtil;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.122.133:3000"})

public class SignupController { 

    @Autowired
    private SignUpRepository signUpRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public String signup(@RequestBody SignUp signup) {

        // Check duplicate email
        if (signUpRepository.findByEmail(signup.getEmail()) != null) {
            return "Email already exists!";
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(signup.getPassword());
        signup.setPassword(hashedPassword);

        //  Save user
        signUpRepository.save(signup);

        return "Signup successful!";
    }
  // api for login  
@Autowired
private JwtUtil jwtoken;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody SignUp loginData) {

    SignUp user = signUpRepository.findByEmail(loginData.getEmail());

    if (user == null) {
        return ResponseEntity.status(404).body("User not found");
    }

    if (passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {

        //  Generate token
        String token = jwtoken.generateToken(user.getEmail());

        return ResponseEntity.ok(token);

    } else {
        return ResponseEntity.status(401).body("Invalid password");
    }
}
}  