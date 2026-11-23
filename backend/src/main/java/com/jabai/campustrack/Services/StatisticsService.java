package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Responses.StatisticsResponseDto;
import com.jabai.campustrack.DTOs.Responses.WorkerStatisticsResponseDto;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.BuildingRepository;
import com.jabai.campustrack.Repositories.IncidentRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StatisticsService {
    private static final List<IncidentStatus> INSPECTION_STATUSES = List.of(
            IncidentStatus.REPORTED,
            IncidentStatus.ASSIGNED,
            IncidentStatus.INSPECTING,
            IncidentStatus.IN_PROGRESS
    );

    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public StatisticsService(
            BuildingRepository buildingRepository,
            RoomRepository roomRepository,
            AssetRepository assetRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository
    ) {
        this.buildingRepository = buildingRepository;
        this.roomRepository = roomRepository;
        this.assetRepository = assetRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StatisticsResponseDto getAdminStatistics() {
        return new StatisticsResponseDto(
                buildingRepository.count(),
                roomRepository.count(),
                assetRepository.count(),
                incidentRepository.count(),
                userRepository.count()
        );
    }

    @Transactional(readOnly = true)
    public WorkerStatisticsResponseDto getWorkerStatistics(Long workerId) {
        return new WorkerStatisticsResponseDto(
                incidentRepository.countByAssignedToId(workerId),
                incidentRepository.countByAssignedToIdAndStatusIn(workerId, INSPECTION_STATUSES),
                incidentRepository.countByAssignedToIdAndStatus(workerId, IncidentStatus.PENDING_REVIEW),
                incidentRepository.countByAssignedToIdAndStatus(workerId, IncidentStatus.APPROVED),
                incidentRepository.countByAssignedToIdAndStatus(workerId, IncidentStatus.RESOLVED),
                incidentRepository.countByAssignedToIdAndStatus(workerId, IncidentStatus.REJECTED)
        );
    }
}
