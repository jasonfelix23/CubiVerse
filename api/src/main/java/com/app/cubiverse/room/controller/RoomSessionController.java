package com.app.cubiverse.room.controller;

import java.time.Instant;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.cubiverse.room.entity.Room;
import com.app.cubiverse.room.repository.RoomRepository;
import com.app.cubiverse.room.service.RoomSessionService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/rooms")
public class RoomSessionController {
    private final RoomRepository rooms;
    private final RoomSessionService sessions;

    public RoomSessionController(RoomRepository rooms, RoomSessionService sessions) {
        this.rooms = rooms;
        this.sessions = sessions;
    }

    public record RoomMetaResponse(String roomCode, String roomName, int occupants) {}

    @GetMapping("/{code}/meta")
    public ResponseEntity<RoomMetaResponse> meta(@PathVariable String code) {
        Room room = rooms.findByRoomCode(code).orElse(null);
        if (room == null) return ResponseEntity.notFound().build();
        //TODO: replace occupants with real number
        return ResponseEntity.ok(new RoomMetaResponse(code, room.getName(), 0));
    }

    public record CreateSessionRequest(String displayName) { }
    public record CreateSessionResponse(String sessionId, Instant exp) {}

    @PostMapping("/{code}/session")
    public ResponseEntity<CreateSessionResponse> createSession(@PathVariable String code, @RequestBody(required = false) CreateSessionRequest body) {
        if (rooms.findByRoomCode(code).isEmpty()) return ResponseEntity.notFound().build();

        var res = sessions.create(code, null, body != null? body.displayName(): null);
        ResponseCookie cookie = ResponseCookie.from("roomSession." + code, res.sessionId()).httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(java.time.Duration.between(Instant.now(), res.expiresAt())).build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(new CreateSessionResponse(res.sessionId(), res.expiresAt()));
    }

    @DeleteMapping("/{code}/session/{sessionId}") 
    public ResponseEntity<Void> deleteSession(@PathVariable String code, @PathVariable String sessionId) {
        sessions.delete(sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{code}/session")
    public ResponseEntity<Void> deleteSessionByCookie(@PathVariable String code, HttpServletRequest request) {
        String cookieName = "roomSession." + code;
        String sessionId = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c: cookies) {
                if (cookieName.equals(c.getName())) {
                    sessionId = c.getValue();
                    break;
                }
            }
        }
        if (sessionId != null && !sessionId.isBlank()) {
            sessions.delete(sessionId);
        }

        ResponseCookie cleared = ResponseCookie.from(cookieName, "")
        .httpOnly(true)
        .secure(false)
        .sameSite("Lax")
        .path("/")
        .maxAge(0)
        .build();

        return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, cleared.toString()).build();
    }

        // Optional stub for future heartbeat
    @PostMapping("/{code}/session/ping")
    public ResponseEntity<Void> ping(@PathVariable String code) {
        return ResponseEntity.noContent().build();
    }
}
