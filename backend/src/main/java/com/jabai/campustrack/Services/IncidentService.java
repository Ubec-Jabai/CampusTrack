package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.DTOs.Responses.IncidentPhotoResponseDto;
import com.jabai.campustrack.DTOs.Responses.IncidentResponseDto;
import com.jabai.campustrack.DTOs.Responses.RoomResponseDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.DuplicatedRowException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Models.Enums.UserRole;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.IncidentRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.Specifications.IncidentSpecifications;
import com.jabai.campustrack.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class IncidentService {
    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final IncidentPhotoService incidentPhotoService;

    public IncidentService(IncidentRepository incidents, RoomRepository rooms, AssetRepository assets, UserRepository users, IncidentPhotoService incidentPhotoService) {
        this.incidentRepository = incidents;
        this.roomRepository = rooms;
        this.assetRepository = assets;
        this.userRepository = users;
        this.incidentPhotoService = incidentPhotoService;
    }

    // Create
    public IncidentResponseDto createIncident(CreateIncidentRequestDto request, MultipartFile image) {
        Long roomId = request.getRoomId();
        Long reportedById = request.getReportedById();
        IncidentCategory category = request.getCategory();
        IncidentPriority priority = request.getPriority();
        IncidentStatus status = request.getStatus();
        String incidentNumber = request.getIncidentNumber();
        String description = request.getDescription();
        Boolean safetyHazard = request.getSafetyHazard();
        Boolean operationalImpact = request.getOperationalImpact();

        Long assetId = request.getAssetId();
        Long assignedToId = request.getAssignedToId();
        Integer affectedArea = request.getAffectedArea();

        LocalDateTime evaluatedAt = request.getEvaluatedAt();
        LocalDateTime resolvedAt = request.getResolvedAt();
        LocalDateTime closedAt = request.getClosedAt();

        Room foundRoom = roomRepository
                .findById(roomId)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the room with an ID of %d.", roomId)));
        User foundReportedByUser = userRepository
                .findById(reportedById)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", reportedById)));

        Incident incident = new Incident(
                foundRoom,
                foundReportedByUser,
                incidentNumber,
                description,
                safetyHazard,
                operationalImpact,
                affectedArea,
                category,
                priority,
                status
        );

        if (incidentRepository.existsByIncidentNumber(incidentNumber))
            throw new DuplicatedRowException("Incident number already exists.");

        if (assetId != null) {
            Asset foundAsset = assetRepository
                    .findById(assetId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the asset with an ID of %d.", assetId)));
            incident.setAsset(foundAsset);

            if (assignedToId == null && status == IncidentStatus.REPORTED)
                autoAssignToWorker(incident, foundAsset.getSpecialty());
        }
        if (assignedToId != null) {
            User foundAssignedToUser = userRepository
                    .findById(assignedToId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", assignedToId)));
            assignIncident(incident, foundAssignedToUser);
        }
        if (evaluatedAt != null)
            incident.setEvaluatedAt(evaluatedAt);
        if (resolvedAt != null)
            incident.setResolvedAt(resolvedAt);
        if (closedAt != null)
            incident.setClosedAt(closedAt);

        // photo_path stores the Supabase filename returned by the microservice, not the local upload name.
        String photoFilename = incidentPhotoService.uploadIncidentPhoto(image, foundReportedByUser);
        incident.setPhotoPath(photoFilename);
        deletePhotoOnRollback(photoFilename, foundReportedByUser);

        Incident response = incidentRepository.save(incident);

        return buildIncidentResponseDto(response);
    }

    // Read all
    public Page<IncidentResponseDto> getIncidents(Pageable pageable) {
        return incidentRepository
                .findAll(pageable)
                .map(this::buildIncidentResponseDto);
    }

    // Search
    @Transactional(readOnly = true)
    public Page<IncidentResponseDto> searchIncidents(SearchIncidentRequestDto request, Pageable pageable) {
        LocalDate fromDate = request.getFrom();
        LocalDate toDate = request.getTo();

        LocalDateTime from = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime to = toDate == null ? null : toDate.plusDays(1).atStartOfDay();

        Specification<Incident> spec = Specification
                .where(IncidentSpecifications.hasAssetId(request.getAssetId()))
                .and(IncidentSpecifications.hasRoomId(request.getRoomId()))
                .and(IncidentSpecifications.hasReportedById(request.getReportedById()))
                .and(IncidentSpecifications.hasAssignedToId(request.getAssignedToId()))
                .and(IncidentSpecifications.hasIncidentNumber(request.getIncidentNumber()))
                .and(IncidentSpecifications.hasDescriptionKeyword(request.getDescription()))
                .and(IncidentSpecifications.hasSafetyHazard(request.getSafetyHazard()))
                .and(IncidentSpecifications.hasOperationalImpact(request.getOperationalImpact()))
                .and(IncidentSpecifications.hasAffectedArea(request.getAffectedArea()))
                .and(IncidentSpecifications.hasCategory(request.getCategory()))
                .and(IncidentSpecifications.hasPriority(request.getPriority()))
                .and(IncidentSpecifications.hasStatus(request.getStatus()))
                .and(IncidentSpecifications.createdBetween(from, to));

        return incidentRepository.findAll(spec, pageable).map(this::buildIncidentResponseDto);
    }

    // Read
    public IncidentResponseDto getIncident(Long id) {
        Incident response = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));
        return buildIncidentResponseDto(response);
    }

    // Read photo link
    public IncidentPhotoResponseDto getIncidentPhoto(Long id, Long requesterId) {
        Incident incident = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));

        String photoPath = incident.getPhotoPath();
        if (photoPath == null || photoPath.isBlank())
            throw new RowNotFoundException(String.format("The incident with an ID of %d has no photo.", id));   

        User requester = userRepository
                .findById(requesterId)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", requesterId)));

        return incidentPhotoService.getIncidentPhotoLink(photoPath, requester);
    }

    // Update
    public IncidentResponseDto updateIncident(Long id, UpdateIncidentRequestDto request) {
        Incident foundIncident = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));

        Long roomId = request.getRoomId();
        Long reportedById = request.getReportedById();
        Long assetId = request.getAssetId();
        Long assignedToId = request.getAssignedToId();
        IncidentCategory category = request.getCategory();
        IncidentStatus status = request.getStatus();
        IncidentPriority priority = request.getPriority();
        String incidentNumber = request.getIncidentNumber();
        String description = request.getDescription();
        Boolean safetyHazard = request.getSafetyHazard();
        Boolean operationalImpact = request.getOperationalImpact();
        Integer affectedArea = request.getAffectedArea();
        LocalDateTime evaluatedAt = request.getEvaluatedAt();
        LocalDateTime resolvedAt = request.getResolvedAt();
        LocalDateTime closedAt = request.getClosedAt();

        if (roomId != null) {
            Room room = roomRepository
                    .findById(roomId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the room with an ID of %d.", roomId)));
            foundIncident.setRoom(room);
        }
        if (reportedById != null) {
            User user = userRepository
                    .findById(reportedById)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", reportedById)));
            foundIncident.setReportedBy(user);
        }
        if (assetId != null) {
            Asset asset = assetRepository
                    .findById(assetId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the asset with an ID of %d.", assetId)));
            foundIncident.setAsset(asset);
        }
        if (assignedToId != null) {
            User user = userRepository
                    .findById(assignedToId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", assignedToId)));
            assignIncident(foundIncident, user);
        }
        if (category != null)
            foundIncident.setCategory(category);
        if (status != null)
            foundIncident.setStatus(status);
        if (priority != null)
            foundIncident.setPriority(priority);
        if (incidentRepository.existsByIncidentNumber(incidentNumber))
            throw new DuplicatedRowException("Incident number already exists.");
        if (incidentNumber != null)
            foundIncident.setIncidentNumber(incidentNumber);
        if (description != null)
            foundIncident.setDescription(description);
        if (safetyHazard != null)
            foundIncident.setSafetyHazard(safetyHazard);
        if (operationalImpact != null)
            foundIncident.setOperationalImpact(operationalImpact);
        if (affectedArea != null)
            foundIncident.setAffectedArea(affectedArea);
        if (evaluatedAt != null)
            foundIncident.setEvaluatedAt(evaluatedAt);
        if (resolvedAt != null)
            foundIncident.setResolvedAt(resolvedAt);
        if (closedAt != null)
            foundIncident.setClosedAt(closedAt);

        Incident response = incidentRepository.save(foundIncident);
        return buildIncidentResponseDto(response);
    }

    // Delete
    public void deleteIncident(Long id) {
        Incident response = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));
        incidentRepository.delete(response);
    }

    // ===== Service Utils =====

    // Supabase is outside the DB transaction, so a rolled-back insert must remove the uploaded file.
    private void deletePhotoOnRollback(String filename, User uploadedBy) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != TransactionSynchronization.STATUS_ROLLED_BACK) return;

                try {
                    incidentPhotoService.deleteIncidentPhoto(filename, uploadedBy);
                } catch (RuntimeException e) {
                    log.error("Failed to delete incident photo {} after rollback", filename, e);
                }
            }
        });
    }

    private void autoAssignToWorker(Incident incident, Specialty specialty) {
        if (specialty == null) return;

        List<User> candidates = userRepository.findAvailableWorkersBySpecialty(
                specialty, UserRole.WORKER, PageRequest.of(0, 1));
        if (candidates.isEmpty()) return;

        assignIncident(incident, candidates.getFirst());
    }

    private void assignIncident(Incident incident, User worker) {
        boolean changed = incident.getAssignedTo() == null
                || !Objects.equals(incident.getAssignedTo().getId(), worker.getId());

        incident.setAssignedTo(worker);
        if (!changed) return;

        LocalDateTime now = LocalDateTime.now();
        incident.setAssignedAt(now);

        if (incident.getStatus() == IncidentStatus.REPORTED
                || incident.getStatus() == IncidentStatus.PENDING_REVIEW
                || incident.getStatus() == IncidentStatus.APPROVED) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }

        if (worker.getUserRole() == UserRole.WORKER && worker.getProfile() != null) {
            worker.getProfile().setLastAssignedAt(now);
        }
    }

    // used by @PreAuthorize in the controller - CHRIS CHAN
    @Transactional(readOnly = true)
    public boolean isOwner(Long incidentId, String userId) {
        return incidentRepository
                .findById(incidentId)
                .map(incident -> incident.getReportedBy().getId().toString().equals(userId))
                .orElse(false);
    }

    private IncidentResponseDto buildIncidentResponseDto(Incident incident) {
        Room room = incident.getRoom();
        User reportedBy = incident.getReportedBy();
        Asset asset = incident.getAsset();
        User assignedTo = incident.getAssignedTo();

        RoomResponseDto roomResponseDto = new RoomResponseDto(
                room.getId(),
                room.getCreatedAt(),
                room.getBuilding().getId(),
                room.getRoomNumber(),
                room.getCapacity(),
                room.getRoomType(),
                room.getCriticality()
        );

        UserProfileResponseDto userProfileResponseDto = UserProfileResponseDto.from(reportedBy);

        IncidentResponseDto incidentResponseDto = new IncidentResponseDto(
                incident.getId(),
                incident.getCreatedAt(),
                incident.getEvaluatedAt(),
                incident.getResolvedAt(),
                incident.getClosedAt(),
                roomResponseDto,
                userProfileResponseDto,
                incident.getIncidentNumber(),
                incident.getDescription(),
                incident.getSafetyHazard(),
                incident.getOperationalImpact(),
                incident.getCategory(),
                incident.getPriority(),
                incident.getStatus()
        );

        if (asset != null)
            incidentResponseDto.setAsset(new AssetResponseDto(
                    asset.getId(),
                    asset.getRoom().getId(),
                    asset.getName(),
                    asset.getBrand(),
                    asset.getModel(),
                    asset.getSerialNumber(),
                    asset.getCategory(),
                    asset.getStatus(),
                    asset.getCondition(),
                    asset.getCriticality(),
                    asset.getCreatedAt(),
                    asset.getSpecialty()
            ));
        if (assignedTo != null) {
            incidentResponseDto.setAssigned(UserProfileResponseDto.from(assignedTo));
            incidentResponseDto.setAssignedToId(assignedTo.getId());
        }
        incidentResponseDto.setAssignedAt(incident.getAssignedAt());
        incidentResponseDto.setPhotoPath(incident.getPhotoPath());

        return incidentResponseDto;
    }
}