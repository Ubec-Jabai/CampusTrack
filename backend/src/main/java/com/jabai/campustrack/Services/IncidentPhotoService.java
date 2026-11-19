package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Responses.IncidentPhotoResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.IncidentPhotoException;
import com.jabai.campustrack.Models.User;
import com.jabai.campustrack.Securities.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
public class IncidentPhotoService {
  private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES =
          Set.of("image/jpeg", "image/png", "image/webp");

  private final RestClient restClient;
  private final JwtUtil jwtUtil;

  public IncidentPhotoService(
          @Value("${spring.application.microservices.incident-photo}") String incidentPhotoUrl,
          JwtUtil jwtUtil
  ) {
    this.restClient = RestClient
            .builder()
            .baseUrl(incidentPhotoUrl)
            .build();
    this.jwtUtil = jwtUtil;
  }

  public String uploadIncidentPhoto(MultipartFile image, User uploadedBy) {
    MultipartBodyBuilder body = new MultipartBodyBuilder();
    body.part("image", imageBytes(image))
            .filename(originalFilename(image))
            .contentType(imageContentType(image.getContentType()));

    try {
      IncidentPhotoResponseDto response = restClient.post()
              .uri("upload/")
              .contentType(MediaType.MULTIPART_FORM_DATA)
              .accept(MediaType.APPLICATION_JSON)
              .header("Authorization", "Bearer " + jwtUtil.generateToken(uploadedBy))
              .body(body.build())
              .retrieve()
              .body(IncidentPhotoResponseDto.class);

      if (response == null || response.getFilename() == null || response.getFilename().isBlank())
        throw new IncidentPhotoException("Incident photo service returned an empty filename", 502);

      return response.getFilename();
    } catch (RestClientResponseException e) {
      String message = e.getResponseBodyAsString();
      if (message.isBlank()) { message = "Incident photo upload failed"; }
      throw new IncidentPhotoException(message, e.getStatusCode().value());
    } catch (RestClientException e) {
      throw new IncidentPhotoException("Incident photo service unavailable", 503);
    }
  }

  public void deleteIncidentPhoto(String filename, User uploadedBy) {
    try {
      restClient.delete()
              .uri(filename)
              .header("Authorization", "Bearer " + jwtUtil.generateToken(uploadedBy))
              .retrieve()
              .toBodilessEntity();
    } catch (RestClientResponseException e) {
      String message = e.getResponseBodyAsString();
      if (message.isBlank()) { message = "Incident photo deletion failed"; }
      throw new IncidentPhotoException(message, e.getStatusCode().value());
    } catch (RestClientException e) {
      throw new IncidentPhotoException("Incident photo service unavailable", 503);
    }
  }

  private byte[] imageBytes(MultipartFile image) {
    try {
      return image.getBytes();
    } catch (IOException e) {
      throw new IncidentPhotoException("Unable to read the incident photo", 500);
    }
  }

  private String originalFilename(MultipartFile image) {
    String originalFilename = image.getOriginalFilename();
    if (originalFilename == null || originalFilename.isBlank())
      return "incident-photo";
    return originalFilename;
  }

  private MediaType imageContentType(String contentType) {
    if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType))
      throw new IncidentPhotoException("Only JPEG, PNG, and WebP images are allowed.", 415);
    return MediaType.parseMediaType(contentType);
  }
}
