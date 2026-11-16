package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.IncidentStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface IncidentStatusHistoryRepository extends JpaRepository<IncidentStatusHistory, Long>, JpaSpecificationExecutor<IncidentStatusHistory> {
  @Override
  @EntityGraph(attributePaths = {"incident", "changedBy"})
  Optional<IncidentStatusHistory> findById(Long id);

  @Override
  @EntityGraph(attributePaths = {"incident", "changedBy"})
  Page<IncidentStatusHistory> findAll(Pageable pageable);
}
