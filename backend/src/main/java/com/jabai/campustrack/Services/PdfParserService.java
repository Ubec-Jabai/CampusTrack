package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.PdfParserRequestDto;
import com.jabai.campustrack.DTOs.Responses.PdfParserResponseDto;
import com.jabai.campustrack.Exceptions.CustomExceptions.PdfParserException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;


@Service
public class PdfParserService {
  private final RestClient restClient;
  private final String pdfParserUrl;
  private final ObjectMapper objectMapper;

  public PdfParserService(
          @Value("${spring.application.microservices.pdf-parser}") String pdfParserUrl
  ) {
    this.restClient = RestClient.builder().build();
    this.pdfParserUrl = pdfParserUrl;
    this.objectMapper = new ObjectMapper();
  }

  public ResponseEntity<PdfParserResponseDto> parsePdf(PdfParserRequestDto pdfParserRequestDto, String Authorization) {
    String json;

    try {
      json = objectMapper.writeValueAsString(pdfParserRequestDto);
    } catch (JacksonException e) {
      throw new PdfParserException("Failed to serialize PDF parser request", 500);
    }

    try {
      PdfParserResponseDto response = restClient.post()
              .uri(pdfParserUrl)
              .contentType(MediaType.APPLICATION_JSON)
              .accept(MediaType.APPLICATION_JSON)
              .header("Authorization", Authorization)
              .body(json)
              .retrieve()
              .body(PdfParserResponseDto.class);

      if (response == null) {
        throw new PdfParserException("PDF parser returned empty response", 502);
      }

      return ResponseEntity.ok(response);
    } catch (RestClientResponseException e) {
      String message = e.getResponseBodyAsString();
      if (message.isBlank()) { message = "PDF parser request failed"; }
      throw new PdfParserException(message, e.getStatusCode().value());
    } catch (RestClientException e) {
      throw new PdfParserException("PDF parser service unavailable", 503);
    }
  }
}
