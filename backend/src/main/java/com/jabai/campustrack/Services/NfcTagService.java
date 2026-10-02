package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateNfcTagRequestDto;
import com.jabai.campustrack.DTOs.Responses.NfcTagResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.NfcTagStatus;
import com.jabai.campustrack.Models.NfcTag;
import com.jabai.campustrack.Repositories.AssetRepository;
import com.jabai.campustrack.Repositories.NfcTagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %s", assetId)));
    NfcTag newNfcTag = new NfcTag(foundAsset, uid, status);
    NfcTag response = nfcTagRepository.save(newNfcTag);

    return buildNfcTagResponse(response);
  }

  // Read all
  public Page<NfcTagResponseDto> readAll(Pageable pageable) {
    return nfcTagRepository
            .findAll(pageable)
            .map(this::buildNfcTagResponse);
  }

  // Read
  public NfcTagResponseDto read(Long id) {
    NfcTag foundNfcTag = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %s", id)));

    return buildNfcTagResponse(foundNfcTag);
  }

  // Update
  public NfcTagResponseDto update(UpdateNfcTagRequestDto updateNfcTagRequestDto, Long id) {
    Long assetId = updateNfcTagRequestDto.getAssetId();
    String uid = updateNfcTagRequestDto.getUid();
    NfcTagStatus status = updateNfcTagRequestDto.getNfcTagStatus();

    NfcTag foundNfcTag = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %s", id)));

    if (assetId != null) {
      Asset foundAsset = assetRepository
              .findById(assetId)
              .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find asset with an ID of %s", assetId)));
      foundNfcTag.setAsset(foundAsset);
    }
    if (uid != null)
      foundNfcTag.setUid(uid);
    if (status != null)
      foundNfcTag.setStatus(status);

    NfcTag response = nfcTagRepository.save(foundNfcTag);

    return buildNfcTagResponse(response);
  }

  // Delete
  public void delete(Long id) {
    NfcTag response = nfcTagRepository
            .findById(id)
            .orElseThrow(() -> new RowNotFoundException(String.format("Unable to find nfc tag with an ID of %s", id)));

    nfcTagRepository.delete(response);
  }

  // ===== Service Utils =====
  private NfcTagResponseDto buildNfcTagResponse(NfcTag nfcTag) {
    return new NfcTagResponseDto(
            nfcTag.getId(),
            nfcTag.getCreatedAt(),
            nfcTag.getAsset().getId(),
            nfcTag.getUid(),
            nfcTag.getStatus()
    );
  }
}
