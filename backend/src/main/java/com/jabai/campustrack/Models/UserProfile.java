package com.jabai.campustrack.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", updatable = false, insertable = false)
    @Generated
    private LocalDateTime createdAt;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "suffix", length = 20)
    private String suffix;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "student_number", length = 50, unique = true)
    private String studentNumber;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "avatar_path", length = 500)
    private String avatarPath;

    protected UserProfile() {}

    public UserProfile(User user) {
        this.user = user;
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getFirstName() { return firstName; }
    public String getMiddleName() { return middleName; }
    public String getLastName() { return lastName; }
    public String getSuffix() { return suffix; }
    public String getPhone() { return phone; }
    public String getStudentNumber() { return studentNumber; }
    public String getDepartment() { return department; }
    public String getAvatarPath() { return avatarPath; }

    // Setters
    public void setUser(User user) { this.user = user; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setSuffix(String suffix) { this.suffix = suffix; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
    public void setDepartment(String department) { this.department = department; }
    public void setAvatarPath(String avatarPath) { this.avatarPath = avatarPath; }
}
