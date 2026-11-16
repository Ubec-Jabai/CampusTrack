package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.WorkerSpecialty;
import com.jabai.campustrack.Models.WorkerSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkerSpecialtyRepository extends JpaRepository<WorkerSpecialty, WorkerSpecialtyId>, JpaSpecificationExecutor<WorkerSpecialty> { }
