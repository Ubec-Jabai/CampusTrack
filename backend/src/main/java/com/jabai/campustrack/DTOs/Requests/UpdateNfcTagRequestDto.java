package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.NfcTagStatus;

public class UpdateNfcTagRequestDto {
  private final Long assetId;
  private final String uid;
  private final NfcTagStatus nfcTagStatus;

  public UpdateNfcTagRequestDto(Long assetId, String uid, NfcTagStatus nfcTagStatus) {
    this.assetId = assetId;
    this.uid = uid;
    this.nfcTagStatus = nfcTagStatus;
  }

  // Getters
  public Long getAssetId() { return assetId; }
  public String getUid() { return uid; }
  public NfcTagStatus getNfcTagStatus() { return nfcTagStatus; }
}
