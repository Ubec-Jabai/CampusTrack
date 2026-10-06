package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateIncidentRequestDto;
import com.jabai.campustrack.DTOs.Responses.IncidentResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Room;
import com.jabai.campustrack.Models.Enums.IncidentPriority;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.IncidentRepository;
import com.jabai.campustrack.Repositories.RoomRepository;
import com.jabai.campustrack.Repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional
public class IncidentService {
    private final IncidentRepository incidents;
    private final RoomRepository rooms;
    private final AssetRepository assets;
    private final UserRepository users;

    public IncidentService(IncidentRepository incidents, RoomRepository rooms,
                           AssetRepository assets, UserRepository users) {
        this.incidents = incidents;
        this.rooms = rooms;
        this.assets = assets;
        this.users = users;
    }

    public IncidentResponseDto createIncident(CreateIncidentRequestDto request) {
        Room room = findRoom(request.roomId());
        Asset asset = request.assetId() == null ? null : findAsset(request.assetId());
        validateLocation(room, asset);
        var reporter = users.findById(request.reportedById())
                .orElseThrow(() -> new RowNotFoundException("Reporter was not found."));
        // Required schema defaults; priority evaluation will be implemented in a later step.
        Incident incident = new Incident(asset, room, reporter, null,
                "INC-" + UUID.randomUUID(), request.description().trim(), request.safetyHazard(),
                request.operationalImpact(), request.affectedArea(), 0, request.category(),
                IncidentPriority.LOW, IncidentStatus.REPORTED);
        return response(incidents.save(incident));
    }

    @Transactional(readOnly = true)
    public Page<IncidentResponseDto> getIncidents(Pageable pageable) {
        return incidents.findAll(pageable).map(this::response);
    }

    @Transactional(readOnly = true)
    public IncidentResponseDto getIncident(Long id) {
        return response(findIncident(id));
    }

    public IncidentResponseDto updateIncident(Long id, UpdateIncidentRequestDto request) {
        Incident incident = findIncident(id);
        Room room = request.roomId() == null ? incident.getRoom() : findRoom(request.roomId());
        Asset asset = request.assetId() == null ? incident.getAsset() : findAsset(request.assetId());
        validateLocation(room, asset);
        incident.setRoom(room);
        incident.setAsset(asset);
        // Only supplied report fields are updated.
        if (request.category() != null) incident.setCategory(request.category());
        if (request.description() != null) incident.setDescription(request.description().trim());
        if (request.safetyHazard() != null) incident.setSafetyHazard(request.safetyHazard());
        if (request.operationalImpact() != null) incident.setOperationalImpact(request.operationalImpact());
        if (request.affectedArea() != null) incident.setAffectedArea(request.affectedArea());
        return response(incidents.save(incident));
    }

    public void deleteIncident(Long id) {
        // The existing model relationship also deletes this incident's maintenance records.
        incidents.delete(findIncident(id));
    }

    private Incident findIncident(Long id) {
        return incidents.findById(id).orElseThrow(() -> new RowNotFoundException("Incident " + id + " was not found."));
    }

    private Asset findAsset(Long id) {
        return assets.findById(id).orElseThrow(() -> new RowNotFoundException("Asset " + id + " was not found."));
    }

    private Room findRoom(Long id) {
        return rooms.findById(id).orElseThrow(() -> new RowNotFoundException("Room " + id + " was not found."));
    }

    private void validateLocation(Room room, Asset asset) {
        if (asset != null && asset.getRoom().getId() != room.getId()) {
            throw new ResponseStatusException(BAD_REQUEST, "The asset does not belong to the selected room.");
        }
    }

    private IncidentResponseDto response(Incident incident) {
        IncidentResponseDto result = new IncidentResponseDto(incident.getId(), incident.getCreatedAt(),
                incident.getEvaluatedAt(), incident.getResolvedAt(), incident.getClosedAt(),
                incident.getRoom().getId(), incident.getReportedBy().getId(), incident.getIncidentNumber(),
                incident.getDescription(), incident.getSafetyHazard(), incident.getOperationalImpact(),
                incident.getPriorityScore(), incident.getCategory(), incident.getStatus());
        if (incident.getAsset() != null) result.setAssetId(incident.getAsset().getId());
        if (incident.getAssignedTo() != null) result.setAssignedTo(incident.getAssignedTo().getId());
        return result;
    }
}
