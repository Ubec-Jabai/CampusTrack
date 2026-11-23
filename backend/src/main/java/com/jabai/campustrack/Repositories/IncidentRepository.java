package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.Incident;
import com.jabai.campustrack.Models.Enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;

public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {
  boolean existsByIncidentNumber(String incidentNumber);

  long countByAssignedToId(Long assignedToId);

  long countByAssignedToIdAndStatus(Long assignedToId, IncidentStatus status);

  long countByAssignedToIdAndStatusIn(Long assignedToId, Collection<IncidentStatus> statuses);
}
