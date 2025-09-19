package com.app.cubiverse.room.dto;

public record createRoomRequest(
    String name,
    boolean chatEnabled,
    boolean videoEnabled,
    boolean npcEnabled
) { }
