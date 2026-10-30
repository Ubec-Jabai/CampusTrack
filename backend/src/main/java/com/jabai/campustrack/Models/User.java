package com.jabai.campustrack.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.jabai.campustrack.Models.Enums.UserRole;

import org.hibernate.annotations.Generated;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "created_at", updatable = false, insertable = false)
  @Generated
  private LocalDateTime createdAt;

  // Core columns
  @Column(name = "email", nullable = false, unique = true, length = 100)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(name = "user_role", nullable = false)
  private UserRole userRole;

  // One-to-one profile
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
  private UserProfile profile;

  protected User() { }

  public User(String email, String password, UserRole userRole) {
    this.email = email;
    this.password = password;
    this.userRole = userRole;
  }

  // Getters
  public Long getId() { return id; }
  public LocalDateTime getCreatedAt() { return createdAt; }

  public String getEmail() { return email; }
  public String getHashedPassword() { return password; }
  public UserRole getUserRole() { return userRole; }
  public UserProfile getProfile() { return profile; }

  //Setters
  public void setEmail(String value) { email = value; }
  public void setHashedPassword(String value) { password = value; }
  public void setUserRole(UserRole value) { userRole = value; }
  public void setProfile(UserProfile value) { this.profile = value; }
}
