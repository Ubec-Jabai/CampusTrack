package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> { }
