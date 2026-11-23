package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Enums.NotificationType;
import com.jabai.campustrack.Models.Notification;
import org.springframework.data.jpa.domain.Specification;

public class NotificationSpecifications {
  public static Specification<Notification> hasUserId(Long userId) {
    return (root, query, criteriaBuilder) -> {
      if (userId == null)
        return null;
      return criteriaBuilder.equal(root.get("user").get("id"), userId);
    };
  }

  public static Specification<Notification> hasType(NotificationType type) {
    return (root, query, criteriaBuilder) -> {
      if (type == null)
        return null;
      return criteriaBuilder.equal(root.get("type"), type);
    };
  }

  public static Specification<Notification> hasRead(Boolean read) {
    return (root, query, criteriaBuilder) -> {
      if (read == null)
        return null;
      return read
              ? criteriaBuilder.isNotNull(root.get("readAt"))
              : criteriaBuilder.isNull(root.get("readAt"));
    };
  }
}
