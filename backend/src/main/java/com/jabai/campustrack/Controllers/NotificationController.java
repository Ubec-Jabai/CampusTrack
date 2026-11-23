package com.jabai.campustrack.Controllers;

import com.jabai.campustrack.DTOs.Requests.SearchNotificationRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateNotificationRequestDto;
import com.jabai.campustrack.DTOs.Responses.NotificationResponseDto;
import com.jabai.campustrack.DTOs.Responses.NotificationUnreadCountResponseDto;
import com.jabai.campustrack.Services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>NotificationController: CHARLES</h1>
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  // Read all (current user only)
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER', 'STUDENT')")
  @GetMapping
  public ResponseEntity<Page<NotificationResponseDto>> readAll(
          Authentication authentication,
          @Valid SearchNotificationRequestDto searchNotificationRequestDto,
          @PageableDefault(size = 20) Pageable pageable) {
    Long userId = Long.parseLong(authentication.getName());
    Page<NotificationResponseDto> notificationResponseDtoPage = notificationService.readAll(userId, searchNotificationRequestDto, pageable);
    return ResponseEntity.ok(notificationResponseDtoPage);
  }

  // Read unread count
  @PreAuthorize("hasAnyRole('ADMIN', 'WORKER', 'STUDENT')")
  @GetMapping("/unread-count")
  public ResponseEntity<NotificationUnreadCountResponseDto> countUnread(Authentication authentication) {
    Long userId = Long.parseLong(authentication.getName());
    NotificationUnreadCountResponseDto notificationUnreadCountResponseDto = new NotificationUnreadCountResponseDto(notificationService.countUnread(userId));
    return ResponseEntity.ok(notificationUnreadCountResponseDto);
  }

  // Read
  @PreAuthorize("hasRole('ADMIN') or @notificationService.isOwner(#id, authentication.name)")
  @GetMapping("/{id}")
  public ResponseEntity<NotificationResponseDto> read(@PathVariable Long id) {
    NotificationResponseDto notificationResponseDto = notificationService.read(id);
    return ResponseEntity.ok(notificationResponseDto);
  }

  // Update
  @PreAuthorize("hasRole('ADMIN') or @notificationService.isOwner(#id, authentication.name)")
  @PatchMapping("/{id}")
  public ResponseEntity<NotificationResponseDto> update(@PathVariable Long id, @Valid @RequestBody UpdateNotificationRequestDto updateNotificationRequestDto) {
    NotificationResponseDto notificationResponseDto = notificationService.update(id, updateNotificationRequestDto);
    return ResponseEntity.ok(notificationResponseDto);
  }
}
