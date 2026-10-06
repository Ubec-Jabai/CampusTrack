package com.jabai.campustrack.Exceptions;

import com.jabai.campustrack.Exceptions.CustomExceptions.EmailAlreadyExistException;
import com.jabai.campustrack.Exceptions.CustomExceptions.EmailNotFoundException;
import com.jabai.campustrack.Exceptions.CustomExceptions.InvalidCredentialsException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@ControllerAdvice 
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", Objects.requireNonNullElse(ex.getReason(), "Request failed")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> globalExceptionMessage(MethodArgumentNotValidException ex){
        Map<String, String> error = new HashMap<>(); 
        error.put("message", ex.getAllErrors().getFirst().getDefaultMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMissingBody(HttpMessageNotReadableException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Request body is missing or malformed");
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<Map<String,String>> userNotFound(EmailNotFoundException ex){
        Map<String, String> error = new HashMap<>(); 
        error.put("message", ex.getMessage());
        return  ResponseEntity.status(404).body(error); 
    }

    @ExceptionHandler(EmailAlreadyExistException.class)
    public ResponseEntity<Map<String, String>> usernameAlreadyExists(EmailAlreadyExistException ex){
        Map<String,String> error = new HashMap<>(); 
        error.put("message", ex.getMessage());
        return ResponseEntity.status(409).body(error); 
    }
    
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String,String>> invalidCredentials(InvalidCredentialsException ex){
        Map<String,String> error = new HashMap<>(); 
        error.put("message", ex.getMessage());
        return ResponseEntity.status(401).body(error); 
    }

    @ExceptionHandler(RowNotFoundException.class)
    public ResponseEntity<Map<String,String>> rowNotFound(RowNotFoundException ex){
        Map<String,String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(404).body(error);
    }
}
