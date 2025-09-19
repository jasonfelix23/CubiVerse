package com.app.cubiverse.room.dto;

import java.time.LocalDateTime;

import com.app.cubiverse.room.entity.enums.RoomState;

public record roomDto (
    Long id,
    String name,
    String roomCode,
    String hostUsername,
    LocalDateTime createdAt,
    RoomState state,
    boolean chatEnabled,
    boolean videoEnabled,
    boolean npcEnabled,
    int participantCount
) { }
