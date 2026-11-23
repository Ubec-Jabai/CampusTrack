package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.SearchNotificationRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateNotificationRequestDto;
import com.jabai.campustrack.DTOs.Responses.NotificationResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Enums.NotificationType;
import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Notification;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Repositories.NotificationRepository;
import com.jabai.campustrack.Repositories.Specifications.NotificationSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class NotificationService {
  private final NotificationRepository notificationRepository;

  public NotificationService(NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  // Read all
  public Page<NotificationResponseDto> readAll(Long userId, SearchNotificationRequestDto request, Pageable pageable) {
    Specification<Notification> specification = Specification
            .where(NotificationSpecifications.hasUserId(userId))
            .and(NotificationSpecifications.hasType(request.getType()))
            .and(NotificationSpecifications.hasRead(request.getRead()));

    Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

    return notificationRepository
            .findAll(specification, sortedPageable)
            .map(this::buildNotificationResponseDto);
  }

  // Read unread count
  public long countUnread(Long userId) {
    return notificationRepository.countByUser_IdAndReadAtIsNull(userId);
  }

  // Read
  public NotificationResponseDto read(Long id) {
    Notification notification = notificationRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find notification with an ID of %d.", id)));

    return buildNotificationResponseDto(notification);
  }

  // Update
  public NotificationResponseDto update(Long id, UpdateNotificationRequestDto request) {
    Notification foundNotification = notificationRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find notification with an ID of %d.", id)));

    Boolean read = request.getRead();
    if (read != null)
      foundNotification.setReadAt(read ? LocalDateTime.now() : null);

    return buildNotificationResponseDto(notificationRepository.save(foundNotification));
  }

  public void notifyUser(User user, Incident incident, NotificationType type, String message) {
    notificationRepository.save(new Notification(user, incident, type, message));
  }

  // used by @PreAuthorize in the controller
  @Transactional(readOnly = true)
  public boolean isOwner(Long notificationId, String userId) {
    return notificationRepository
            .findById(notificationId)
            .map(notification -> notification.getUser().getId().toString().equals(userId))
            .orElse(false);
  }

  private NotificationResponseDto buildNotificationResponseDto(Notification notification) {
    Incident incident = notification.getIncident();

    return new NotificationResponseDto(
            notification.getId(),
            notification.getCreatedAt(),
            notification.getUser().getId(),
            incident == null ? null : incident.getId(),
            notification.getType(),
            notification.getMessage(),
            notification.getReadAt()
    );
  }
}
