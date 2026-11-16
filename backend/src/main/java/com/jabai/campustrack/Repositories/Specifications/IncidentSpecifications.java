package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Locale;

public class IncidentSpecifications {
    public static Specification<Incident> hasAssetId(Long assetId) {
        return (root, query, cb) -> {
            if (assetId == null)
                return null;
            return cb.equal(root.get("asset").get("id"), assetId);
        };
    }

    public static Specification<Incident> hasRoomId(Long roomId) {
        return (root, query, cb) -> {
            if (roomId == null)
                return null;
            return cb.equal(root.get("room").get("id"), roomId);
        };
    }

    public static Specification<Incident> hasReportedById(Long reportedById) {
        return (root, query, cb) -> {
            if (reportedById == null)
                return null;
            return cb.equal(root.get("reportedBy").get("id"), reportedById);
        };
    }

    public static Specification<Incident> hasAssignedToId(Long assignedToId) {
        return (root, query, cb) -> {
            if (assignedToId == null)
                return null;
            return cb.equal(root.get("assignedTo").get("id"), assignedToId);
        };
    }

    public static Specification<Incident> hasIncidentNumber(String incidentNumber) {
        return (root, query, cb) -> {
            if (incidentNumber == null || incidentNumber.isBlank())
                return null;
            return cb.equal(root.get("incidentNumber"), incidentNumber.trim());
        };
    }

    public static Specification<Incident> hasDescriptionKeyword(String description) {
        return (root, query, cb) -> {
            if (description == null || description.isBlank())
                return null;
            String keyword = description
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%")
                    .replace("_", "\\_");
            return cb.like(cb.lower(root.get("description")), "%" + keyword + "%", '\\');
        };
    }

    public static Specification<Incident> hasSafetyHazard(Boolean safetyHazard) {
        return (root, query, cb) -> {
            if (safetyHazard == null)
                return null;
            return cb.equal(root.get("safetyHazard"), safetyHazard);
        };
    }

    public static Specification<Incident> hasOperationalImpact(Boolean operationalImpact) {
        return (root, query, cb) -> {
            if (operationalImpact == null)
                return null;
            return cb.equal(root.get("operationalImpact"), operationalImpact);
        };
    }

    public static Specification<Incident> hasAffectedArea(Integer affectedArea) {
        return (root, query, cb) -> {
            if (affectedArea == null)
                return null;
            return cb.equal(root.get("affectedArea"), affectedArea);
        };
    }

    public static Specification<Incident> hasCategory(IncidentCategory category) {
        return (root, query, cb) -> {
            if (category == null)
                return null;
            return cb.equal(root.get("category"), category);
        };
    }

    public static Specification<Incident> hasPriority(IncidentPriority priority) {
        return (root, query, cb) -> {
            if (priority == null)
                return null;
            return cb.equal(root.get("priority"), priority);
        };
    }

    public static Specification<Incident> hasStatus(IncidentStatus status) {
        return (root, query, cb) -> {
            if (status == null)
                return null;
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Incident> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null)
                return null;
            if (from == null)
                return cb.lessThan(root.get("createdAt"), to);
            if (to == null)
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            return cb.and(cb.greaterThanOrEqualTo(root.get("createdAt"), from), cb.lessThan(root.get("createdAt"), to));
        };
    }
}
