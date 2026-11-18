package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Enums.UserRole;
import com.jabai.campustrack.Models.User;
import jakarta.persistence.criteria.Path;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Locale;

public final class UserSpecifications {
    private UserSpecifications() {}

    public static Specification<User> hasFirstNameKeyword(String firstName) {
        return hasProfileKeyword("firstName", firstName);
    }

    public static Specification<User> hasLastNameKeyword(String lastName) {
        return hasProfileKeyword("lastName", lastName);
    }

    public static Specification<User> hasStudentNumber(String studentNumber) {
        return hasProfileKeyword("studentNumber", studentNumber);
    }

    public static Specification<User> hasDepartment(String department) {
        return hasProfileKeyword("department", department);
    }

    public static Specification<User> hasEmailKeyword(String email) {
        return (root, query, cb) -> {
            if (email == null || email.isBlank())
                return null;
            return cb.like(cb.lower(root.get("email")), toLikePattern(email), '\\');
        };
    }

    public static Specification<User> hasRole(UserRole userRole) {
        return (root, query, cb) -> {
            if (userRole == null)
                return null;
            return cb.equal(root.get("userRole"), userRole);
        };
    }

    public static Specification<User> hasCreatedAtRange(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null)
                return null;
            if (from == null)
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            if (to == null)
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            return cb.between(root.get("createdAt"), from, to);
        };
    }

    private static Specification<User> hasProfileKeyword(String field, String value) {
        return (root, query, cb) -> {
            if (value == null || value.isBlank())
                return null;
            Path<String> path = root.get("profile").get(field);
            return cb.like(cb.lower(path), toLikePattern(value), '\\');
        };
    }

    private static String toLikePattern(String value) {
        String keyword = value
                .trim()
                .toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + keyword + "%";
    }
}
