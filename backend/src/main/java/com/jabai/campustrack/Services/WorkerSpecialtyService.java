package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateWorkerSpecialtyRequestDto;
import com.jabai.campustrack.DTOs.Responses.WorkerSpecialtyResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.DuplicatedRowException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Models.WorkerSpecialty;
import com.jabai.campustrack.Models.WorkerSpecialtyId;
import com.jabai.campustrack.Repositories.Specifications.WorkerSpecialtySpecifications;
import com.jabai.campustrack.Repositories.UserRepository;
import com.jabai.campustrack.Repositories.WorkerSpecialtyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WorkerSpecialtyService {
  private final WorkerSpecialtyRepository workerSpecialtyRepository;
  private final UserRepository userRepository;

  public WorkerSpecialtyService(WorkerSpecialtyRepository workerSpecialtyRepository, UserRepository userRepository) {
    this.workerSpecialtyRepository = workerSpecialtyRepository;
    this.userRepository = userRepository;
  }

  // Create
  public WorkerSpecialtyResponseDto create(CreateWorkerSpecialtyRequestDto request) {
    Long userId = request.getUserId();
    Specialty specialty = request.getSpecialty();

    User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find user with an ID of %d.", userId)));

    WorkerSpecialtyId id = new WorkerSpecialtyId(userId, specialty);
    if (workerSpecialtyRepository.existsById(id))
      throw new DuplicatedRowException("Specialty already assigned to this worker");

    WorkerSpecialty savedWorkerSpecialty = workerSpecialtyRepository.save(new WorkerSpecialty(user, specialty));

    return buildWorkerSpecialtyResponseDto(savedWorkerSpecialty);
  }

  // Read all
  public Page<WorkerSpecialtyResponseDto> readAll(Pageable pageable) {
    return workerSpecialtyRepository
            .findAll(pageable)
            .map(this::buildWorkerSpecialtyResponseDto);
  }

  // Read
  public WorkerSpecialtyResponseDto read(Long userId, Specialty specialty) {
    WorkerSpecialty workerSpecialty = workerSpecialtyRepository
            .findById(new WorkerSpecialtyId(userId, specialty))
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find specialty %s for worker with an ID of %d.", specialty, userId)));

    return buildWorkerSpecialtyResponseDto(workerSpecialty);
  }

  // Search
  public Page<WorkerSpecialtyResponseDto> search(SearchWorkerSpecialtyRequestDto request, Pageable pageable) {
    Long userId = request.getUserId();
    Specialty specialty = request.getSpecialty();

    Specification<WorkerSpecialty> specification = Specification
            .where(WorkerSpecialtySpecifications.hasUserId(userId))
            .and(WorkerSpecialtySpecifications.hasSpecialty(specialty));

    return workerSpecialtyRepository
            .findAll(specification, pageable)
            .map(this::buildWorkerSpecialtyResponseDto);
  }

  // Update
  public WorkerSpecialtyResponseDto update(Long userId, Specialty specialty, UpdateWorkerSpecialtyRequestDto request) {
    Specialty newSpecialty = request.getSpecialty();

    WorkerSpecialty foundWorkerSpecialty = workerSpecialtyRepository
            .findById(new WorkerSpecialtyId(userId, specialty))
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find specialty %s for worker with an ID of %d.", specialty, userId)));

    if (newSpecialty == specialty)
      return buildWorkerSpecialtyResponseDto(foundWorkerSpecialty);

    if (workerSpecialtyRepository.existsById(new WorkerSpecialtyId(userId, newSpecialty)))
      throw new DuplicatedRowException("Specialty already assigned to this worker");

    User user = foundWorkerSpecialty.getUser();
    workerSpecialtyRepository.delete(foundWorkerSpecialty);
    WorkerSpecialty savedWorkerSpecialty = workerSpecialtyRepository.save(new WorkerSpecialty(user, newSpecialty));

    return buildWorkerSpecialtyResponseDto(savedWorkerSpecialty);
  }

  // Delete
  public void delete(Long userId, Specialty specialty) {
    WorkerSpecialty workerSpecialty = workerSpecialtyRepository
            .findById(new WorkerSpecialtyId(userId, specialty))
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find specialty %s for worker with an ID of %d.", specialty, userId)));

    workerSpecialtyRepository.delete(workerSpecialty);
  }

  // ===== Service Utils =====
  private WorkerSpecialtyResponseDto buildWorkerSpecialtyResponseDto(WorkerSpecialty workerSpecialty) {
    return new WorkerSpecialtyResponseDto(
            workerSpecialty.getUser().getId(),
            workerSpecialty.getSpecialty()
    );
  }
}
