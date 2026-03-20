package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Model.SignUp;
import com.example.repository.SignUpRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
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

//REST API for login
@PostMapping("/login")
public String login(@RequestBody SignUp loginData) {

    // ✅ Find user by email
    SignUp user = signUpRepository.findByEmail(loginData.getEmail());

    if (user == null) {
        return "User not found!";
    }

    // ✅ Check password
    if (passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
        return "Login successful";
    } else {
        return "Invalid password";
    }
}

}