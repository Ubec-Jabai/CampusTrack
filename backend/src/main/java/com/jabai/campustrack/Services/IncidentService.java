package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.PdfParserRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.DTOs.Responses.BuildingResponseDto;
import com.jabai.campustrack.DTOs.Responses.IncidentPhotoResponseDto;
import com.jabai.campustrack.DTOs.Responses.IncidentResponseDto;
import com.jabai.campustrack.DTOs.Responses.PdfParserResponseDto;
import com.jabai.campustrack.DTOs.Responses.RoomResponseDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.DuplicatedRowException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.IncidentCategory;
import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Models.UserProfile;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.RoomCriticality;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Models.Enums.NotificationType;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
public class IncidentService {
    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private static final int SAFETY_HAZARD_POINTS = 3;
    private static final int OPERATIONAL_IMPACT_POINTS = 2;
    private static final int AREA_OVER_50_POINTS = 3;
    private static final int AREA_21_TO_50_POINTS = 2;
    private static final int AREA_6_TO_20_POINTS = 1;
    private static final int CRITICALITY_LOW_POINTS = 0;
    private static final int CRITICALITY_NORMAL_POINTS = 1;
    private static final int CRITICALITY_HIGH_POINTS = 3;
    private static final int CRITICALITY_CRITICAL_POINTS = 5;
    private static final int AREA_OVER_50_THRESHOLD = 50;
    private static final int AREA_OVER_20_THRESHOLD = 20;
    private static final int AREA_OVER_5_THRESHOLD = 5;
    private static final int LOW_PRIORITY_MAX_SCORE = 3;
    private static final int MEDIUM_PRIORITY_MAX_SCORE = 7;
    private static final int HIGH_PRIORITY_MAX_SCORE = 12;

    private static final DateTimeFormatter REPORT_DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.US);
    private static final DateTimeFormatter REPORT_TIME_FORMAT = DateTimeFormatter.ofPattern("h:mm a", Locale.US);
    private static final String NOT_AVAILABLE = "N/A";

    private final IncidentRepository incidentRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final IncidentPhotoService incidentPhotoService;
    private final NotificationService notificationService;
    private final PdfParserService pdfParserService;

    public IncidentService(IncidentRepository incidents, RoomRepository rooms, AssetRepository assets, UserRepository users, IncidentPhotoService incidentPhotoService, NotificationService notificationService, PdfParserService pdfParserService) {
        this.incidentRepository = incidents;
        this.roomRepository = rooms;
        this.assetRepository = assets;
        this.userRepository = users;
        this.incidentPhotoService = incidentPhotoService;
        this.notificationService = notificationService;
        this.pdfParserService = pdfParserService;
    }

    // Create
    public IncidentResponseDto createIncident(CreateIncidentRequestDto request, MultipartFile image) {
        Long roomId = request.getRoomId();
        Long reportedById = request.getReportedById();
        IncidentCategory category = request.getCategory();
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

        if (incidentRepository.existsByIncidentNumber(incidentNumber))
            throw new DuplicatedRowException("Incident number already exists.");

        Asset foundAsset = null;
        if (assetId != null) {
            foundAsset = assetRepository
                    .findById(assetId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the asset with an ID of %d.", assetId)));
        }

        IncidentPriority priority = calculatePriority(
                category, safetyHazard, operationalImpact, affectedArea, foundRoom, foundAsset);

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

        User assignedWorker = null;
        if (foundAsset != null) {
            incident.setAsset(foundAsset);

            if (assignedToId == null && status == IncidentStatus.REPORTED)
                assignedWorker = autoAssignToWorker(incident, foundAsset.getSpecialty());
        }
        if (assignedToId != null) {
            User foundAssignedToUser = userRepository
                    .findById(assignedToId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", assignedToId)));
            assignedWorker = assignIncident(incident, foundAssignedToUser);
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

        // The notification FK requires the incident row to exist first.
        if (assignedWorker != null)
            notifyAssignment(response, assignedWorker);

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
    public IncidentResponseDto updateIncident(Long id, UpdateIncidentRequestDto request, Long requesterId) {
        Incident foundIncident = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));

        Long roomId = request.getRoomId();
        Long reportedById = request.getReportedById();
        Long assetId = request.getAssetId();
        Long assignedToId = request.getAssignedToId();
        IncidentCategory category = request.getCategory();
        IncidentStatus status = request.getStatus();
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
        User assignedWorker = null;
        if (assignedToId != null) {
            User user = userRepository
                    .findById(assignedToId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", assignedToId)));
            assignedWorker = assignIncident(foundIncident, user);
        }
        if (category != null)
            foundIncident.setCategory(category);
        if (status != null)
            applyStatusChange(foundIncident, status, request.getRejectionReason(), requesterId);
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

        foundIncident.setPriority(calculatePriority(
                foundIncident.getCategory(),
                foundIncident.getSafetyHazard(),
                foundIncident.getOperationalImpact(),
                foundIncident.getAffectedArea(),
                foundIncident.getRoom(),
                foundIncident.getAsset()));

        if (foundIncident.getStatus() == IncidentStatus.RESOLVED && foundIncident.getReportLink() == null)
            attachIncidentReport(foundIncident, requesterId);

        Incident response = incidentRepository.save(foundIncident);

        if (assignedWorker != null)
            notifyAssignment(response, assignedWorker);

        return buildIncidentResponseDto(response);
    }

    // Delete
    public void deleteIncident(Long id, Long requesterId) {
        Incident incident = incidentRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the incident with an ID of %d.", id)));

        String photoPath = incident.getPhotoPath();
        if (photoPath != null && !photoPath.isBlank()) {
            User requester = userRepository
                    .findById(requesterId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", requesterId)));
            incidentPhotoService.deleteIncidentPhoto(photoPath, requester);
        }

        incidentRepository.delete(incident);
    }

    // ===== Service Utils =====

    private void applyStatusChange(Incident incident, IncidentStatus status, String rejectionReason, Long requesterId) {
        IncidentStatus previousStatus = incident.getStatus();

        if (status == IncidentStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required.");
            incident.setRejectionReason(rejectionReason.trim());
        } else {
            incident.setRejectionReason(null);
        }

        if (status == IncidentStatus.PENDING_REVIEW) {
            User requester = userRepository
                    .findById(requesterId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", requesterId)));
            incident.setInspectedBy(requester);
            incident.setInspectedAt(LocalDateTime.now());
        }
        if (status == IncidentStatus.APPROVED)
            incident.setApprovedAt(LocalDateTime.now());
        if (status == IncidentStatus.RESOLVED)
            incident.setResolvedAt(LocalDateTime.now());

        incident.setStatus(status);

        if (previousStatus == status) return;

        switch (status) {
            case APPROVED -> notificationService.notifyUser(
                    incident.getReportedBy(), incident, NotificationType.INCIDENT_APPROVED,
                    String.format("Incident %s has been approved.", incident.getIncidentNumber()));
            case REJECTED -> notificationService.notifyUser(
                    incident.getReportedBy(), incident, NotificationType.INCIDENT_REJECTED,
                    String.format("Incident %s has been rejected. Reason: %s", incident.getIncidentNumber(), incident.getRejectionReason()));
            default -> { }
        }
    }

    // Report generation must never block resolving the incident. A later PATCH to RESOLVED retries while the link is null.
    private void attachIncidentReport(Incident incident, Long requesterId) {
        try {
            User requester = userRepository
                    .findById(requesterId)
                    .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find the user with an ID of %d.", requesterId)));
            PdfParserResponseDto report = pdfParserService.createIncidentReport(buildReportRequest(incident, requester), requester);

            if (report == null || report.getLink() == null || report.getLink().isBlank()) {
                log.error("PDF service returned no link for incident {}", incident.getIncidentNumber());
                return;
            }

            incident.setReportLink(asDownloadLink(report.getLink(), incident.getIncidentNumber()));
        } catch (RuntimeException e) {
            log.error("Failed to generate PDF report for incident {}", incident.getIncidentNumber(), e);
        }
    }

    // Supabase serves stored PDFs as text/plain; the download param adds an attachment disposition.
    private String asDownloadLink(String link, String incidentNumber) {
        return link + (link.contains("?") ? "&" : "?") + "download=" + incidentNumber + ".pdf";
    }

    private PdfParserRequestDto buildReportRequest(Incident incident, User requester) {
        Room room = incident.getRoom();

        PdfParserRequestDto.ReportInfo report = new PdfParserRequestDto.ReportInfo(
                incident.getIncidentNumber(),
                formatReportDate(incident.getResolvedAt()),
                formatReportDate(incident.getCreatedAt()),
                formatReportTime(incident.getCreatedAt()),
                String.format("Room %s, %s", room.getRoomNumber(), room.getBuilding().getName()),
                toReportSeverity(incident.getPriority()));

        List<PdfParserRequestDto.InvolvedParty> involvedParties = new ArrayList<>();
        involvedParties.add(toInvolvedParty(incident.getReportedBy()));
        User assignedTo = incident.getAssignedTo();
        if (assignedTo != null && !Objects.equals(assignedTo.getId(), incident.getReportedBy().getId()))
            involvedParties.add(toInvolvedParty(assignedTo));

        PdfParserRequestDto.IncidentDetails details = new PdfParserRequestDto.IncidentDetails(
                incident.getDescription() == null || incident.getDescription().isBlank()
                        ? "No description provided."
                        : incident.getDescription(),
                String.format("Incident resolved by %s on %s.", fullName(requester), formatReportDate(incident.getResolvedAt())));

        PdfParserRequestDto.Preparer preparer = new PdfParserRequestDto.Preparer(
                fullName(requester),
                requester.getUserRole().name(),
                departmentOf(requester));

        return new PdfParserRequestDto(report, involvedParties, details, preparer);
    }

    private PdfParserRequestDto.InvolvedParty toInvolvedParty(User user) {
        UserProfile profile = user.getProfile();
        String idNumber = profile == null || profile.getStudentNumber() == null || profile.getStudentNumber().isBlank()
                ? String.valueOf(user.getId())
                : profile.getStudentNumber();

        return new PdfParserRequestDto.InvolvedParty(
                idNumber,
                fullName(user),
                user.getUserRole().name(),
                departmentOf(user),
                contactOf(user));
    }

    private String fullName(User user) {
        UserProfile profile = user.getProfile();
        if (profile == null) return user.getEmail();
        return (profile.getFirstName() + " " + profile.getLastName()).trim();
    }

    private String departmentOf(User user) {
        UserProfile profile = user.getProfile();
        if (profile == null || profile.getDepartment() == null || profile.getDepartment().isBlank())
            return NOT_AVAILABLE;
        return profile.getDepartment();
    }

    private String contactOf(User user) {
        UserProfile profile = user.getProfile();
        if (profile == null || profile.getPhone() == null || profile.getPhone().isBlank())
            return user.getEmail();
        return profile.getPhone();
    }

    private PdfParserRequestDto.Severity toReportSeverity(IncidentPriority priority) {
        if (priority == null) return PdfParserRequestDto.Severity.LOW;

        return switch (priority) {
            case CRITICAL, HIGH -> PdfParserRequestDto.Severity.HIGH;
            case MEDIUM -> PdfParserRequestDto.Severity.MEDIUM;
            case LOW -> PdfParserRequestDto.Severity.LOW;
        };
    }

    private String formatReportDate(LocalDateTime value) {
        return value == null ? NOT_AVAILABLE : value.format(REPORT_DATE_FORMAT);
    }

    private String formatReportTime(LocalDateTime value) {
        return value == null ? NOT_AVAILABLE : value.format(REPORT_TIME_FORMAT);
    }

    private void notifyAssignment(Incident incident, User worker) {
        notificationService.notifyUser(
                worker, incident, NotificationType.INCIDENT_ASSIGNED,
                String.format("You have been assigned to incident %s.", incident.getIncidentNumber()));
    }

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

    private IncidentPriority calculatePriority(IncidentCategory category, boolean safetyHazard,
                                               boolean operationalImpact, int affectedArea,
                                               Room room, Asset asset) {
        // Hazard reports are critical by policy, regardless of the weighted score.
        if (category == IncidentCategory.SAFETY_HAZARD && safetyHazard)
            return IncidentPriority.CRITICAL;

        int score = (safetyHazard ? SAFETY_HAZARD_POINTS : 0)
                + (operationalImpact ? OPERATIONAL_IMPACT_POINTS : 0)
                + areaPoints(affectedArea)
                + criticalityPoints(room.getCriticality());

        if (asset != null)
            score += criticalityPoints(asset.getCriticality());

        if (score <= LOW_PRIORITY_MAX_SCORE)
            return IncidentPriority.LOW;
        if (score <= MEDIUM_PRIORITY_MAX_SCORE)
            return IncidentPriority.MEDIUM;
        if (score <= HIGH_PRIORITY_MAX_SCORE)
            return IncidentPriority.HIGH;
        return IncidentPriority.CRITICAL;
    }

    private int areaPoints(int affectedArea) {
        if (affectedArea > AREA_OVER_50_THRESHOLD)
            return AREA_OVER_50_POINTS;
        if (affectedArea > AREA_OVER_20_THRESHOLD)
            return AREA_21_TO_50_POINTS;
        if (affectedArea > AREA_OVER_5_THRESHOLD)
            return AREA_6_TO_20_POINTS;
        return 0;
    }

    private int criticalityPoints(AssetCriticality criticality) {
        return switch (criticality) {
            case LOW -> CRITICALITY_LOW_POINTS;
            case NORMAL -> CRITICALITY_NORMAL_POINTS;
            case HIGH -> CRITICALITY_HIGH_POINTS;
            case CRITICAL -> CRITICALITY_CRITICAL_POINTS;
        };
    }

    private int criticalityPoints(RoomCriticality criticality) {
        return switch (criticality) {
            case LOW -> CRITICALITY_LOW_POINTS;
            case NORMAL -> CRITICALITY_NORMAL_POINTS;
            case HIGH -> CRITICALITY_HIGH_POINTS;
            case CRITICAL -> CRITICALITY_CRITICAL_POINTS;
        };
    }

    private User autoAssignToWorker(Incident incident, Specialty specialty) {
        if (specialty == null) return null;

        List<User> candidates = userRepository.findAvailableWorkersBySpecialty(
                specialty, UserRole.WORKER, PageRequest.of(0, 1));
        if (candidates.isEmpty()) return null;

        return assignIncident(incident, candidates.getFirst());
    }

    private User assignIncident(Incident incident, User worker) {
        boolean changed = incident.getAssignedTo() == null
                || !Objects.equals(incident.getAssignedTo().getId(), worker.getId());

        incident.setAssignedTo(worker);
        if (!changed) return null;

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

        return worker;
    }

    // used by @PreAuthorize in the controller - CHRIS CHAN
    @Transactional(readOnly = true)
    public boolean isOwner(Long incidentId, String userId) {
        return incidentRepository
                .findById(incidentId)
                .map(incident -> incident.getReportedBy().getId().toString().equals(userId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isAssignedWorker(Long incidentId, String userId) {
        return incidentRepository
                .findById(incidentId)
                .map(incident -> incident.getAssignedTo() != null
                        && incident.getAssignedTo().getId().toString().equals(userId))
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
                new BuildingResponseDto(
                        room.getBuilding().getId(),
                        room.getBuilding().getName(),
                        room.getBuilding().getCreatedAt()
                ),
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
                incident.getAffectedArea(),
                incident.getCategory(),
                incident.getPriority(),
                incident.getStatus()
        );

        if (asset != null) {
            Room assetRoom = asset.getRoom();
            incidentResponseDto.setAsset(new AssetResponseDto(
                    asset.getId(),
                    new RoomResponseDto(
                            assetRoom.getId(),
                            assetRoom.getCreatedAt(),
                            new BuildingResponseDto(
                                    assetRoom.getBuilding().getId(),
                                    assetRoom.getBuilding().getName(),
                                    assetRoom.getBuilding().getCreatedAt()
                            ),
                            assetRoom.getRoomNumber(),
                            assetRoom.getCapacity(),
                            assetRoom.getRoomType(),
                            assetRoom.getCriticality()
                    ),
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
        }
        if (assignedTo != null) {
            incidentResponseDto.setAssigned(UserProfileResponseDto.from(assignedTo));
            incidentResponseDto.setAssignedToId(assignedTo.getId());
        }
        incidentResponseDto.setAssignedAt(incident.getAssignedAt());
        incidentResponseDto.setPhotoPath(incident.getPhotoPath());
        incidentResponseDto.setReportLink(incident.getReportLink());
        if (incident.getInspectedBy() != null)
            incidentResponseDto.setInspectedBy(UserProfileResponseDto.from(incident.getInspectedBy()));
        incidentResponseDto.setInspectedAt(incident.getInspectedAt());
        incidentResponseDto.setApprovedAt(incident.getApprovedAt());
        incidentResponseDto.setRejectionReason(incident.getRejectionReason());

        return incidentResponseDto;
    }
}