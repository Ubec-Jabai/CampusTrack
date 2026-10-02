package com.jabai.campustrack.DTOs.Requests;

import com.jabai.campustrack.Models.Enums.NfcTagStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateNfcTagRequestDto {
  @NotNull(message = "Asset ID is required.")
  private final long assetId;

  @NotBlank(message = "UID is required.")
  @Size(max = 100, message = "UID must be 0 to 100 characters.")
  private final String uid;

  @NotNull(message = "Status is required.")
  private final NfcTagStatus status;

  public CreateNfcTagRequestDto(long assetId, String uid, NfcTagStatus status) {
    this.assetId = assetId;
    this.uid = uid;
    this.status = status;
  }

  // Getters
  public long getAssetId() { return assetId; }
  public String getUid() { return uid; }
  public NfcTagStatus getStatus() { return status; }
}
