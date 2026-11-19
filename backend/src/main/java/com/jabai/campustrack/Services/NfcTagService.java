package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Responses.AssetResponseDto;
import com.jabai.campustrack.DTOs.Responses.NfcTagResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.DuplicatedRowException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.NfcTagStatus;
import com.jabai.campustrack.Models.NfcTag;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.NfcTagRepository;
import com.jabai.campustrack.Repositories.Specifications.NfcTagSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class NfcTagService {
  private final NfcTagRepository nfcTagRepository;
  private final AssetRepository assetRepository;

  public NfcTagService(NfcTagRepository nfcTagRepository, AssetRepository assetRepository) {
    this.nfcTagRepository = nfcTagRepository;
    this.assetRepository = assetRepository;
  }

  // ===== Main operations =====
  // Create
  public NfcTagResponseDto create(CreateNfcTagRequestDto createNfcTagRequestDto) {
    Long assetId = createNfcTagRequestDto.getAssetId();
    String uid = createNfcTagRequestDto.getUid();
    NfcTagStatus status = createNfcTagRequestDto.getStatus();

    Asset foundAsset = assetRepository
            .findById(assetId)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %d.", assetId)));
    if (nfcTagRepository.existsByUid(uid))
      throw new DuplicatedRowException("UID already existed");

    NfcTag newNfcTag = new NfcTag(foundAsset, uid, status);
    NfcTag response = nfcTagRepository.save(newNfcTag);

    return buildNfcTagResponseDto(response);
  }

  // Read all
  public Page<NfcTagResponseDto> readAll(Pageable pageable) {
    return nfcTagRepository
            .findAll(pageable)
            .map(this::buildNfcTagResponseDto);
  }

  // Read
  public NfcTagResponseDto read(Long id) {
    NfcTag foundNfcTag = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %d.", id)));

    return buildNfcTagResponseDto(foundNfcTag);
  }

  // Search
  public Page<NfcTagResponseDto> search(SearchNfcTagRequestDto searchNfcTagRequestDto, Pageable pageable) {
    LocalDate fromDate = searchNfcTagRequestDto.getFrom();
    LocalDate toDate = searchNfcTagRequestDto.getTo();
    Long assetId = searchNfcTagRequestDto.getAssetId();
    String uid = searchNfcTagRequestDto.getUid();
    NfcTagStatus status = searchNfcTagRequestDto.getStatus();

    LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
    LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

    Specification<NfcTag> specification = Specification
            .where(NfcTagSpecifications.hasAssetId(assetId))
            .and(NfcTagSpecifications.hasUid(uid))
            .and(NfcTagSpecifications.hasStatus(status))
            .and(NfcTagSpecifications.betweenCreated(from, to));

    return nfcTagRepository
            .findAll(specification, pageable)
            .map(this::buildNfcTagResponseDto);
  }

  // Update
  public NfcTagResponseDto update(UpdateNfcTagRequestDto updateNfcTagRequestDto, Long id) {
    Long assetId = updateNfcTagRequestDto.getAssetId();
    String uid = updateNfcTagRequestDto.getUid();
    NfcTagStatus status = updateNfcTagRequestDto.getNfcTagStatus();

    NfcTag foundNfcTag = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %d.", id)));

    if (nfcTagRepository.existsByUid(uid))
      throw new DuplicatedRowException("UID already existed");
    if (assetId != null) {
      Asset foundAsset = assetRepository
              .findById(assetId)
              .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %d.", assetId)));
      foundNfcTag.setAsset(foundAsset);
    }
    if (uid != null)
      foundNfcTag.setUid(uid);
    if (status != null)
      foundNfcTag.setStatus(status);

    NfcTag response = nfcTagRepository.save(foundNfcTag);

    return buildNfcTagResponseDto(response);
  }

  // Delete
  public void delete(Long id) {
    NfcTag response = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %d.", id)));

    nfcTagRepository.delete(response);
  }

  // ===== Service Utils =====
  private NfcTagResponseDto buildNfcTagResponseDto(NfcTag nfcTag) {
    AssetResponseDto assetResponseDto = new AssetResponseDto(
            nfcTag.getAsset().getId(),
            nfcTag.getAsset().getRoom().getId(),
            nfcTag.getAsset().getName(),
            nfcTag.getAsset().getBrand(),
            nfcTag.getAsset().getModel(),
            nfcTag.getAsset().getSerialNumber(),
            nfcTag.getAsset().getCategory(),
            nfcTag.getAsset().getStatus(),
            nfcTag.getAsset().getCondition(),
            nfcTag.getAsset().getCriticality(),
              nfcTag.getAsset().getCreatedAt(),
            nfcTag.getAsset().getSpecialty()
    );

    return new NfcTagResponseDto(
            nfcTag.getId(),
            nfcTag.getCreatedAt(),
            assetResponseDto,
            nfcTag.getUid(),
            nfcTag.getStatus()
    );
  }
}
