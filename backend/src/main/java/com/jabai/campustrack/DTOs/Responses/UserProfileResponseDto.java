package com.jabai.campustrack.DTOs.Responses;

import com.jabai.campustrack.Models.Enums.UserRole;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Models.UserProfile;

import java.time.LocalDateTime;

public class UserProfileResponseDto {
    private Long id;
    private String email;
    private UserRole userRole;
    private LocalDateTime createdAt;
    private ProfileDto profile;

    public UserProfileResponseDto() {}

    public static UserProfileResponseDto from(User user) {
        UserProfileResponseDto dto = new UserProfileResponseDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUserRole(user.getUserRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setProfile(ProfileDto.from(user.getProfile()));
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getUserRole() { return userRole; }
    public void setUserRole(UserRole userRole) { this.userRole = userRole; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ProfileDto getProfile() { return profile; }
    public void setProfile(ProfileDto profile) { this.profile = profile; }

    public static class ProfileDto {
        private String firstName;
        private String middleName;
        private String lastName;
        private String suffix;
        private String phone;
        private String studentNumber;
        private String department;
        private String avatarPath;
        private LocalDateTime createdAt;

        public ProfileDto() {}

        public static ProfileDto from(UserProfile profile) {
            if (profile == null) return null;
            ProfileDto dto = new ProfileDto();
            dto.setFirstName(profile.getFirstName());
            dto.setMiddleName(profile.getMiddleName());
            dto.setLastName(profile.getLastName());
            dto.setSuffix(profile.getSuffix());
            dto.setPhone(profile.getPhone());
            dto.setStudentNumber(profile.getStudentNumber());
            dto.setDepartment(profile.getDepartment());
            dto.setAvatarPath(profile.getAvatarPath());
            dto.setCreatedAt(profile.getCreatedAt());
            return dto;
        }

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

        public String getAvatarPath() { return avatarPath; }
        public void setAvatarPath(String avatarPath) { this.avatarPath = avatarPath; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
