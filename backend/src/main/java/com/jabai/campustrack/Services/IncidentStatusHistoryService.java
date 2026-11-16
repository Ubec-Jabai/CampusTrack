package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentStatusHistoryRequestDto;
import com.jabai.campustrack.DTOs.Responses.IncidentStatusHistoryResponseDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.IncidentStatusHistory;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Repositories.IncidentRepository;
import com.jabai.campustrack.Repositories.IncidentStatusHistoryRepository;
import com.jabai.campustrack.Repositories.Specifications.IncidentStatusHistorySpecifications;
import com.jabai.campustrack.Repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@Transactional
public class IncidentStatusHistoryService {
  private final IncidentStatusHistoryRepository incidentStatusHistoryRepository;
  private final IncidentRepository incidentRepository;
  private final UserRepository userRepository;

  public IncidentStatusHistoryService(
          IncidentStatusHistoryRepository incidentStatusHistoryRepository,
          IncidentRepository incidentRepository,
          UserRepository userRepository
  ) {
    this.incidentStatusHistoryRepository = incidentStatusHistoryRepository;
    this.incidentRepository = incidentRepository;
    this.userRepository = userRepository;
  }

  // Create
  public IncidentStatusHistoryResponseDto create(CreateIncidentStatusHistoryRequestDto request) {
    Long incidentId = request.getIncidentId();
    Long changedById = request.getChangedById();

    Incident incident = incidentRepository
            .findById(incidentId)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find incident with an ID of %d.", incidentId)));
    User changedBy = userRepository
            .findById(changedById)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find user with an ID of %d.", changedById)));

    IncidentStatusHistory incidentStatusHistory = new IncidentStatusHistory(
            incident,
            request.getFromStatus(),
            request.getToStatus(),
            changedBy
    );

    return buildIncidentStatusHistoryResponseDto(incidentStatusHistoryRepository.save(incidentStatusHistory));
  }

  // Read all
  public Page<IncidentStatusHistoryResponseDto> readAll(Pageable pageable) {
    return incidentStatusHistoryRepository
            .findAll(pageable)
            .map(this::buildIncidentStatusHistoryResponseDto);
  }

  // Read
  public IncidentStatusHistoryResponseDto read(Long id) {
    IncidentStatusHistory incidentStatusHistory = incidentStatusHistoryRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find incident status history with an ID of %d.", id)));

    return buildIncidentStatusHistoryResponseDto(incidentStatusHistory);
  }

  // Search
  public Page<IncidentStatusHistoryResponseDto> search(SearchIncidentStatusHistoryRequestDto request, Pageable pageable) {
    Long incidentId = request.getIncidentId();
    IncidentStatus fromStatus = request.getFromStatus();
    IncidentStatus toStatus = request.getToStatus();
    Long changedById = request.getChangedById();

    LocalDate changedFromDate = request.getChangedFrom();
    LocalDate changedToDate = request.getChangedTo();
    LocalDateTime changedFrom = changedFromDate == null ? null : changedFromDate.atStartOfDay();
    LocalDateTime changedTo = changedToDate == null ? null : changedToDate.atTime(LocalTime.MAX);

    Specification<IncidentStatusHistory> specification = Specification
            .where(IncidentStatusHistorySpecifications.hasIncidentId(incidentId))
            .and(IncidentStatusHistorySpecifications.hasFromStatus(fromStatus))
            .and(IncidentStatusHistorySpecifications.hasToStatus(toStatus))
            .and(IncidentStatusHistorySpecifications.hasChangedById(changedById))
            .and(IncidentStatusHistorySpecifications.changedAtBetween(changedFrom, changedTo));

    return incidentStatusHistoryRepository
            .findAll(specification, pageable)
            .map(this::buildIncidentStatusHistoryResponseDto);
  }

  // Update
  public IncidentStatusHistoryResponseDto update(Long id, UpdateIncidentStatusHistoryRequestDto request) {
    IncidentStatusHistory foundIncidentStatusHistory = incidentStatusHistoryRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find incident status history with an ID of %d.", id)));

    Long incidentId = request.getIncidentId();
    IncidentStatus fromStatus = request.getFromStatus();
    IncidentStatus toStatus = request.getToStatus();
    Long changedById = request.getChangedById();

    if (incidentId != null) {
      Incident incident = incidentRepository
              .findById(incidentId)
              .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find incident with an ID of %d.", incidentId)));
      foundIncidentStatusHistory.setIncident(incident);
    }
    if (fromStatus != null)
      foundIncidentStatusHistory.setFromStatus(fromStatus);
    if (toStatus != null)
      foundIncidentStatusHistory.setToStatus(toStatus);
    if (changedById != null) {
      User changedBy = userRepository
              .findById(changedById)
              .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find user with an ID of %d.", changedById)));
      foundIncidentStatusHistory.setChangedBy(changedBy);
    }

    return buildIncidentStatusHistoryResponseDto(incidentStatusHistoryRepository.save(foundIncidentStatusHistory));
  }

  // Delete
  public void delete(Long id) {
    IncidentStatusHistory incidentStatusHistory = incidentStatusHistoryRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find incident status history with an ID of %d.", id)));

    incidentStatusHistoryRepository.delete(incidentStatusHistory);
  }

  private IncidentStatusHistoryResponseDto buildIncidentStatusHistoryResponseDto(IncidentStatusHistory incidentStatusHistory) {
    return new IncidentStatusHistoryResponseDto(
            incidentStatusHistory.getId(),
            incidentStatusHistory.getIncident().getId(),
            incidentStatusHistory.getFromStatus(),
            incidentStatusHistory.getToStatus(),
            UserProfileResponseDto.from(incidentStatusHistory.getChangedBy()),
            incidentStatusHistory.getChangedAt()
    );
  }
}
