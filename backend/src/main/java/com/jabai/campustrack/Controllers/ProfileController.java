package com.jabai.campustrack.Controllers;


import com.jabai.campustrack.DTOs.Requests.UpdateUserPasswordRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateUserProfileRequestDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;
import com.jabai.campustrack.Services.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <h1>ProfileController: JADE</h1>
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
  private final UserService userService;

  public ProfileController(UserService userService) {
    this.userService = userService;
  }

  // Get
  @GetMapping("/me")
  public ResponseEntity<UserProfileResponseDto> me(Authentication authentication) {
    Long userId = Long.parseLong(authentication.getName());
    UserProfileResponseDto response = userService.getUserProfile(userId);
    return ResponseEntity.ok().body(response);
  }

  // Update
  @PatchMapping("/me")
  public ResponseEntity<UserProfileResponseDto> updateMe(Authentication authentication, @Valid @RequestBody UpdateUserProfileRequestDto request) {
    Long id = Long.parseLong(authentication.getName());
    UserProfileResponseDto updatedUserProfile = userService.updateUserProfile(id, request);
    return ResponseEntity.ok(updatedUserProfile);
  }

  // Change password
  @PatchMapping("/me/change-password")
  public ResponseEntity<UserProfileResponseDto> changePassword(Authentication authentication, @Valid @RequestBody UpdateUserPasswordRequestDto request) {
    Long id = Long.parseLong(authentication.getName());
    UserProfileResponseDto updatedPassword = userService.updateUserPassword(id, request);
    return ResponseEntity.ok(updatedPassword);
  }

  // Delete
  @DeleteMapping("/me")
  public ResponseEntity<Void> deleteAccount(Authentication auth) {
    Long id = Long.parseLong(auth.getName());
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
