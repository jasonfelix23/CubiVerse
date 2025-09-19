package com.app.cubiverse.room.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.cubiverse.auth.security.JwtUtil;
import com.app.cubiverse.auth.service.UserService;
import com.app.cubiverse.room.dto.JoinRoomResponse;
import com.app.cubiverse.room.dto.createRoomRequest;
import com.app.cubiverse.room.dto.roomDto;
import com.app.cubiverse.room.entity.Room;
import com.app.cubiverse.room.service.RoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    private String extractEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            throw new UsernameNotFoundException("Missing or invalid Authorization Header");
        } 
        String token = authHeader.substring(7);
        String email = jwtUtil.validateToken(token);
        if (email == null) {
            throw new UsernameNotFoundException("Invalid Token");
        }
        return email;
    }

    private roomDto toDto(Room room) {
        int participantCount = 0;
        if (room.getParticipants() != null) {
            participantCount = room.getParticipants().size();
        }
        return new roomDto(
            room.getId(),
            room.getName(),
            room.getRoomCode(),
            room.getHost().getUsername(),
            room.getCreatedAt(),
            room.getState(),
            room.isChatEnabled(),
            room.isVideoEnabled(),
            room.isNpcEnabled(),
            participantCount);
    }

    @PostMapping
    public ResponseEntity<roomDto> createRoom(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody createRoomRequest req
        ) {
            System.out.println("-----------------------------------" + req + "----------------------------");
            System.out.println("---------------------" + authHeader + "---------------------");
            String email = extractEmail(authHeader);
            var room = roomService.createRoom(
                req.name(),
                req.chatEnabled(),
                req.videoEnabled(),
                req.npcEnabled(),
                email
            );
            return ResponseEntity.ok(toDto(room));
    }

    @GetMapping("/{code}")
    public ResponseEntity<JoinRoomResponse> joinRoom(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable String code
    ) {
        String email = extractEmail(authHeader);
        roomService.joinRoom(code, email);
        return ResponseEntity.ok(new JoinRoomResponse(code, true));
    }

    @PostMapping("/{code}/end")
    public ResponseEntity<Void> endRoom(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable String code
    ){
        String email = extractEmail(authHeader);
        roomService.endRoom(code);
        return ResponseEntity.ok().build();
    }

}
