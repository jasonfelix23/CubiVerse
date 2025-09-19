package com.app.cubiverse.room.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "room_sessions")
public class RoomSession {
    
    @Id
    @Column(name = "session_id", nullable = false, updatable = false, length = 40)
    private String sessionId;

    @Column(name = "room_code", nullable= false, length = 64)
    private String roomCode;

    @Column(name = "user_id")
    private String userId;  //nullable guests allowed

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected RoomSession() {}

    public RoomSession(String sessionId, String roomCode, String userId, String displayName, Instant createdAt, Instant expiresAt) {
        this.sessionId = sessionId;
        this.roomCode = roomCode;
        this.userId = userId;
        this.displayName = displayName;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public String getSessionId() { return sessionId;};
    public String getRoomCode() { return roomCode; }
    public String getUserId() { return userId; }
    public String getDisplayName() { return displayName; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }

}
