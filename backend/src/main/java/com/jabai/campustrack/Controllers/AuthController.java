package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.LoginUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.RegisterUserRequestDto;
import com.jabai.campustrack.DTOs.Responses.LoginUserResponseDto;
import com.jabai.campustrack.DTOs.Responses.RegisterUserResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /**
     * METHOD LEVEL AUTHORIZATION EXAMPLES
     * Mga example ni sya bai
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin-only-test")
    public ResponseEntity<String> adminRaniSyaBai() {
        return ResponseEntity.ok().body("Hello world daw bai ana si admin");
    }

    @PreAuthorize("hasRole('WORKER')")
    @GetMapping("/worker-only-test")
    public ResponseEntity<String> workerRaniSyaBai() {
        return ResponseEntity.ok().body("Hello world daw bai ana si worker");
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/user-only-test")
    public ResponseEntity<String> userRaniSyaBai() {
        return ResponseEntity.ok().body("Hello world daw bai ana si user");
    }
}
