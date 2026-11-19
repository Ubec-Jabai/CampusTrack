package com.jabai.campustrack.Repositories;

import java.util.List;
import java.util.Optional;

import com.jabai.campustrack.Models.Enums.Specialty;
import com.jabai.campustrack.Models.Enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jabai.campustrack.Models.*;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);

    boolean existsByProfile_StudentNumber(String studentNumber);

    @Override
    @EntityGraph(attributePaths = "profile")
    Optional<User> findById(Long id);

    @Override
    @EntityGraph(attributePaths = "profile")
    Page<User> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "profile")
    Page<User> findAll(Specification<User> spec, Pageable pageable);

    @Query("""
            select u
            from User u
            join fetch u.profile p
            where u.userRole = :role
              and p.available = true
              and exists (
                  select ws
                  from WorkerSpecialty ws
                  where ws.user = u
                    and ws.specialty = :specialty
              )
            order by case when p.lastAssignedAt is null then 0 else 1 end,
                     p.lastAssignedAt asc,
                     u.id asc
            """)
    List<User> findAvailableWorkersBySpecialty(
            @Param("specialty") Specialty specialty,
            @Param("role") UserRole role,
            Pageable pageable);
}
