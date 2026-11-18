package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.UserRole;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class SearchUserRequestDto {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final UserRole userRole;
    private final String studentNumber;
    private final String department;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private final LocalDate to;

    public SearchUserRequestDto(
            String firstName,
            String lastName,
            String email,
            UserRole userRole,
            String studentNumber,
            String department,
            LocalDate from,
            LocalDate to
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userRole = userRole;
        this.studentNumber = studentNumber;
        this.department = department;
        this.from = from;
        this.to = to;
    }

    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public UserRole getUserRole() { return userRole; }
    public String getStudentNumber() { return studentNumber; }
    public String getDepartment() { return department; }
    public LocalDate getFrom() { return from; }
    public LocalDate getTo() { return to; }
}
