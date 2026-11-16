package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Models.IncidentStatusHistory;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class IncidentStatusHistorySpecifications {
  public static Specification<IncidentStatusHistory> hasIncidentId(Long incidentId) {
    return (root, query, criteriaBuilder) -> {
      if (incidentId == null)
        return null;
      return criteriaBuilder.equal(root.get("incident").get("id"), incidentId);
    };
  }

  public static Specification<IncidentStatusHistory> hasFromStatus(IncidentStatus fromStatus) {
    return (root, query, criteriaBuilder) -> {
      if (fromStatus == null)
        return null;
      return criteriaBuilder.equal(root.get("fromStatus"), fromStatus);
    };
  }

  public static Specification<IncidentStatusHistory> hasToStatus(IncidentStatus toStatus) {
    return (root, query, criteriaBuilder) -> {
      if (toStatus == null)
        return null;
      return criteriaBuilder.equal(root.get("toStatus"), toStatus);
    };
  }

  public static Specification<IncidentStatusHistory> hasChangedById(Long changedById) {
    return (root, query, criteriaBuilder) -> {
      if (changedById == null)
        return null;
      return criteriaBuilder.equal(root.get("changedBy").get("id"), changedById);
    };
  }

  public static Specification<IncidentStatusHistory> changedAtBetween(LocalDateTime from, LocalDateTime to) {
    return (root, query, criteriaBuilder) -> {
      if (from == null && to == null)
        return null;
      if (from == null)
        return criteriaBuilder.lessThanOrEqualTo(root.get("changedAt"), to);
      if (to == null)
        return criteriaBuilder.greaterThanOrEqualTo(root.get("changedAt"), from);
      return criteriaBuilder.between(root.get("changedAt"), from, to);
    };
  }
}
