package com.app.cubiverse.room.dto;

public record JoinRoomResponse(
    String roomCode,
    boolean joined
) { }
