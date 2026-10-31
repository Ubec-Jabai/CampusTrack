package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
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
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.IncidentRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.Specifications.IncidentSpecifications;
import com.jabai.campustrack.Repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidents, RoomRepository rooms, AssetRepository assets, UserRepository users) {
        this.incidentRepository = incidents;
        this.roomRepository = rooms;
        this.assetRepository = assets;
        this.userRepository = users;
    }

    // Create
    public IncidentResponseDto createIncident(CreateIncidentRequestDto request) {
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
        Integer priorityScore = request.getPriorityScore();

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
                priorityScore,
                category,
                priority,
                status
        );

        if (incidentRepository.existsByIncidentNumber(incidentNumber))
            throw new DuplicatedRowException("Incident number already exists.");

        if (assetId != null) {
            Asset foundAsset = assetRepository
                    .findById(assetId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the asset with an ID of %d.", reportedById)));
            incident.setAsset(foundAsset);
        }
        if (assignedToId != null) {
            User foundAssignedToUser = userRepository
                    .findById(assignedToId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", reportedById)));
            incident.setAssignedTo(foundAssignedToUser);
        }
        if (evaluatedAt != null)
            incident.setEvaluatedAt(evaluatedAt);
        if (resolvedAt != null)
            incident.setResolvedAt(resolvedAt);
        if (closedAt != null)
            incident.setClosedAt(closedAt);

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
                .and(IncidentSpecifications.hasPriorityScore(request.getPriorityScore()))
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
        Integer priorityScore = request.getPriorityScore();
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
            foundIncident.setAssignedTo(user);
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
            foundIncident.setAssignedTo(user);
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
        if (priorityScore != null)
            foundIncident.setPriorityScore(priorityScore);
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
                incident.getPriorityScore(),
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
                    asset.getCreatedAt()
            ));
        if (assignedTo != null)
            incidentResponseDto.setAssigned(UserProfileResponseDto.from(assignedTo));

        return incidentResponseDto;
    }
}