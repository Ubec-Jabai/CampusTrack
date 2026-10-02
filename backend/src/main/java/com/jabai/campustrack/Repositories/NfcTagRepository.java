package com.jabai.campustrack.Repositories;

import com.jabai.campustrack.Models.NfcTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NfcTagRepository extends JpaRepository<NfcTag, Long> { }
