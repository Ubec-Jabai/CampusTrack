package com.jabai.campustrack.Repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
}
