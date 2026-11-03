package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.LoginUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.RegisterUserRequestDto;
import com.jabai.campustrack.DTOs.Responses.LoginUserResponseDto;
import com.jabai.campustrack.DTOs.Responses.RegisterUserResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jabai.campustrack.Services.UserService;

import jakarta.validation.Valid;

/**
 * <h1>AuthController: JADE</h1>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterUserResponseDto> registerUser(@Valid @RequestBody RegisterUserRequestDto registerUserRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(registerUserRequestDto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginUserResponseDto> loginUser(@Valid @RequestBody LoginUserRequestDto loginUserRequestDto) {
        return ResponseEntity.ok(userService.loginUser(loginUserRequestDto));
    }
}
