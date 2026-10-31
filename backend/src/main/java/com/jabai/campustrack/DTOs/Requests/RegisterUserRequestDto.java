package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Validations.Interfaces.PasswordConfirmable;
import com.jabai.campustrack.Validations.Interfaces.PasswordMatches;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordMatches
public class RegisterUserRequestDto implements PasswordConfirmable {
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
  private String email;

  @NotBlank(message = "Password is required.")
  @Size(min = 8, message = "Password must be at least 8 characters.")
  private String password;

  @NotBlank(message = "Password confirmation is required.")
  private String passwordConfirmation;

  public RegisterUserRequestDto() {}

  // Getters
  public String getFirstName() { return firstName; }
  public String getMiddleName() { return middleName; }
  public String getLastName() { return lastName; }
  public String getSuffix() { return suffix; }
  public String getPhone() { return phone; }
  public String getStudentNumber() { return studentNumber; }
  public String getDepartment() { return department; }
  public String getEmail() { return email; }
  public String getPassword() { return password; }
  public String getPasswordConfirmation() { return passwordConfirmation; }

  // Setters
  public void setFirstName(String firstName) { this.firstName = firstName; }
  public void setMiddleName(String middleName) { this.middleName = middleName; }
  public void setLastName(String lastName) { this.lastName = lastName; }
  public void setSuffix(String suffix) { this.suffix = suffix; }
  public void setPhone(String phone) { this.phone = phone; }
  public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
  public void setDepartment(String department) { this.department = department; }
  public void setEmail(String email) { this.email = email; }
  public void setPassword(String password) { this.password = password; }
  public void setPasswordConfirmation(String passwordConfirmation) { this.passwordConfirmation = passwordConfirmation; }
}
