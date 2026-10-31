package com.jabai.campustrack.DTOs.Responses;

public class LoginUserResponseDto {
  private final String message;
  private final String email;
  private final String token;

  public LoginUserResponseDto(String message, String email, String token) {
    this.message = message;
    this.email = email;
    this.token = token;
  }

  // Getters
  public String getMessage() { return message; }
  public String getEmail() { return email; }
  public String getToken() { return token; }
}
