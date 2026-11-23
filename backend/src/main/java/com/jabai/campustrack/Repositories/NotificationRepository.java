package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NotificationRepository extends JpaRepository<Notification, Long>,
        JpaSpecificationExecutor<Notification> {

  Page<Notification> findByUser_IdOrderByCreatedAtDescIdDesc(Long userId, Pageable pageable);

  long countByUser_IdAndReadAtIsNull(Long userId);
}
