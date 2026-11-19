package com.jabai.campustrack.Exceptions.CustomExceptions;

public class IncidentPhotoException extends RuntimeException {
  private final int status;

  public IncidentPhotoException(String message, int status) {
    super(message);
    this.status = status;
  }

  public int getStatus() {
    return status;
  }
}
