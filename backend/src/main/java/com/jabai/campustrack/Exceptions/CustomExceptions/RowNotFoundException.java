package com.jabai.campustrack.Exceptions.CustomExceptions;

public class RowNotFoundException extends RuntimeException {
  public RowNotFoundException(String message) {
    super(message);
  }
}
