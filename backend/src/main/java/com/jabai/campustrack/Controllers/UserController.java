package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.CreateUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateUserRequestDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;
import com.jabai.campustrack.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>UserController: ADMIN</h1>
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserProfileResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        UserProfileResponseDto createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // Read all
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<UserProfileResponseDto>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserProfileResponseDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    // Search
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<Page<UserProfileResponseDto>> searchUsers(@Valid SearchUserRequestDto request, @PageableDefault(size = 20) Pageable pageable) {
        Page<UserProfileResponseDto> users = userService.searchUsers(request, pageable);
        return ResponseEntity.ok(users);
    }

    // Read
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDto> getUserById(@PathVariable Long id) {
        UserProfileResponseDto user = userService.getUserProfile(id);
        return ResponseEntity.ok(user);
    }

    // Update
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<UserProfileResponseDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDto request) {
        UserProfileResponseDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
