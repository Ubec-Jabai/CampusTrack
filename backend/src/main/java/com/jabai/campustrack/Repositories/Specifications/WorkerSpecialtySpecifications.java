package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Models.WorkerSpecialty;
import org.springframework.data.jpa.domain.Specification;

public final class WorkerSpecialtySpecifications {
  public static Specification<WorkerSpecialty> hasUserId(Long userId) {
    return (root, query, criteriaBuilder) -> {
      if (userId == null)
        return null;
      return criteriaBuilder.equal(root.get("user").get("id"), userId);
    };
  }

  public static Specification<WorkerSpecialty> hasSpecialty(Specialty specialty) {
    return (root, query, criteriaBuilder) -> {
      if (specialty == null)
        return null;
      return criteriaBuilder.equal(root.get("specialty"), specialty);
    };
  }
}
