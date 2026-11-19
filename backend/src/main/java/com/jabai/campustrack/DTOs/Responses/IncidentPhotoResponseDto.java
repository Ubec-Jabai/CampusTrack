package com.jabai.campustrack.DTOs.Responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class IncidentPhotoResponseDto {
  private final String filename;
  private final String link;

  @JsonCreator
  public IncidentPhotoResponseDto(
          @JsonProperty("filename") String filename,
          @JsonProperty("link") String link) {
    this.filename = filename;
    this.link = link;
  }

  // Getters
  public String getFilename() { return filename; }
  public String getLink() { return link; }
}
