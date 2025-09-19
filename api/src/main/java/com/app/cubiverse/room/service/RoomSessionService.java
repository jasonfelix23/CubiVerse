package com.app.cubiverse.room.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.app.cubiverse.room.entity.RoomSession;
import com.app.cubiverse.room.repository.RoomSessionRepository;

@Service
public class RoomSessionService {
    private final RoomSessionRepository repo;
    private final Clock clock = Clock.systemUTC();
    private static final Duration TTL = Duration.ofHours(12);

    public RoomSessionService(RoomSessionRepository repo) { this.repo = repo;}

    public record CreateSessionResult(String sessionId, Instant expiresAt){};

    public CreateSessionResult create(String roomCode, String userId, String displayName) {
        final String sessionId = UUID.randomUUID().toString();
        final Instant now = Instant.now(clock);
        final Instant exp = now.plus(TTL);

        repo.save(new RoomSession(sessionId, roomCode, userId, displayName, now, exp));
        return new CreateSessionResult(sessionId, exp);
    }

    public void delete(String sessionId) { repo.deleteById(sessionId);}
}
