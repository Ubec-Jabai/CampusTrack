package com.jabai.campustrack.DTOs.Requests;

import jakarta.validation.constraints.NotBlank;

public class UpdateBuildingRequestDto {

    @NotBlank(message = "Building name is required.")
    private final String name;

    public UpdateBuildingRequestDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}