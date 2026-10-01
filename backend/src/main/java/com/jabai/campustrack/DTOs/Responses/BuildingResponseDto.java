package com.jabai.campustrack.DTOs.Responses;

import java.time.LocalDateTime;

public class BuildingResponseDto {

    private final Long id;
    private final String name;
    private final LocalDateTime createdAt;

    public BuildingResponseDto(
            Long id,
            String name,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}