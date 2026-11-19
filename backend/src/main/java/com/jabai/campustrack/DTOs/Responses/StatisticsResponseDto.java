package com.jabai.campustrack.DTOs.Responses;

public class StatisticsResponseDto {
    private final long buildings;
    private final long rooms;
    private final long assets;
    private final long incidents;
    private final long users;

    public StatisticsResponseDto(
            long buildings,
            long rooms,
            long assets,
            long incidents,
            long users
    ) {
        this.buildings = buildings;
        this.rooms = rooms;
        this.assets = assets;
        this.incidents = incidents;
        this.users = users;
    }

    public long getBuildings() { return buildings; }
    public long getRooms() { return rooms; }
    public long getAssets() { return assets; }
    public long getIncidents() { return incidents; }
    public long getUsers() { return users; }
}
