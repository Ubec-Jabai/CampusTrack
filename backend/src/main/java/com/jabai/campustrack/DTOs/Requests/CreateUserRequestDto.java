package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateUserRequestDto {
  @NotBlank(message = "First name is required.")
  @Size(max = 100, message = "First name must be 100 characters or fewer.")
  private String firstName;

  @Size(max = 100, message = "Middle name must be 100 characters or fewer.")
  private String middleName;

  @NotBlank(message = "Last name is required.")
  @Size(max = 100, message = "Last name must be 100 characters or fewer.")
  private String lastName;

  @Size(max = 20, message = "Suffix must be 20 characters or fewer.")
  private String suffix;

  @Size(max = 20, message = "Phone must be 20 characters or fewer.")
  private String phone;

  @Size(max = 50, message = "Student number must be 50 characters or fewer.")
  private String studentNumber;

  @Size(max = 100, message = "Department must be 100 characters or fewer.")
  private String department;

  @NotBlank(message = "Email is required.")
  @Email(message = "Please provide a valid email address.")
  @Size(max = 100, message = "Email must be 100 characters or fewer.")
  private String email;

  @NotBlank(message = "Password is required.")
  @Size(min = 8, message = "Password must be at least 8 characters.")
  private String password;

  @NotNull(message = "User role is required.")
  private UserRole userRole;

  public CreateUserRequestDto() {}

  public String getFirstName() { return firstName; }
  public void setFirstName(String firstName) { this.firstName = firstName; }

  public String getMiddleName() { return middleName; }
  public void setMiddleName(String middleName) { this.middleName = middleName; }

  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }

  public String getSuffix() { return suffix; }
  public void setSuffix(String suffix) { this.suffix = suffix; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getStudentNumber() { return studentNumber; }
  public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public UserRole getUserRole() { return userRole; }
  public void setUserRole(UserRole userRole) { this.userRole = userRole; }
}
