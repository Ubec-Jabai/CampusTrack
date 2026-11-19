package com.jabai.campustrack.Exceptions;

import com.jabai.campustrack.Exceptions.CustomExceptions.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@ControllerAdvice 
public class GlobalExceptionHandler {
    // ========== GLOBAL EXCEPTIONS ==========

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> globalExceptionMessage(MethodArgumentNotValidException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getAllErrors().getFirst().getDefaultMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", Objects.requireNonNullElse(ex.getReason(), "Request failed"));
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMissingBody(HttpMessageNotReadableException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Request body is missing or malformed");
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, String>> handleMissingPart(MissingServletRequestPartException ex) {
        Map<String, String> error = new HashMap<>();
        String partName = ex.getRequestPartName();
        error.put("message", "image".equals(partName) ? "Incident photo is required." : partName + " is required.");
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Image must be 5 MB or smaller.");
        return ResponseEntity.status(413).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "You don't have permission to do this.");
        return ResponseEntity.status(403).body(error);
    }

    // ===== CUSTOM EXCEPTIONS =====
    
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String,String>> invalidCredentials(InvalidCredentialsException ex) {
        Map<String,String> error = new HashMap<>(); 
        error.put("message", ex.getMessage());
        return ResponseEntity.status(401).body(error); 
    }

    @ExceptionHandler(RowNotFoundException.class)
    public ResponseEntity<Map<String,String>> rowNotFound(RowNotFoundException ex) {
        Map<String,String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(404).body(error);
    }

    @ExceptionHandler(DuplicatedRowException.class)
    public ResponseEntity<Map<String,String>> duplicatedRow(DuplicatedRowException ex) {
        Map<String,String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(409).body(error);
    }

    @ExceptionHandler(PdfParserException.class)
    public ResponseEntity<Map<String,String>> pdfParser(PdfParserException ex) {
        Map<String,String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(error);
    }

    @ExceptionHandler(IncidentPhotoException.class)
    public ResponseEntity<Map<String,String>> incidentPhoto(IncidentPhotoException ex) {
        Map<String,String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(error);
    }
}
