package com.app.cubiverse.room.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.app.cubiverse.auth.entity.User;
import com.app.cubiverse.auth.service.UserService;
import com.app.cubiverse.room.entity.Room;
import com.app.cubiverse.room.entity.enums.RoomState;
import com.app.cubiverse.room.repository.RoomRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final UserService userservice;

    @Transactional
    public Room createRoom(String name, boolean chatEnabled, boolean videoEnabled, boolean npcEnabled, String hostEmail) {
        User host = userservice.getUserByEmail(hostEmail);
        Room room = Room.builder()
                        .name(name)
                        .roomCode(generateUniqueCode())
                        .host(host)
                        .createdAt(LocalDateTime.now())
                        .state(RoomState.OPEN)
                        .chatEnabled(chatEnabled)
                        .videoEnabled(videoEnabled)
                        .npcEnabled(npcEnabled)
                        .build();

        return roomRepository.save(room);
    }

    /** Lookup by roomCode or 404 */
    public Room getRoomByCode(String roomCode) {
        return roomRepository.findByRoomCode(roomCode).orElseThrow(() -> new RuntimeException("Room not found"));
    }

    /** Add a participant to the room */
    @Transactional
    public Room joinRoom(String roomCode, String userEmail) {
        User user = userservice.getUserByEmail(userEmail);
        Room room = getRoomByCode(roomCode);
        room.getParticipants().add(user);
        return roomRepository.save(room);
    }

    /** Remove a participant from the room */
    @Transactional
    public Room leaveRoom(String roomCode, String userEmail) {
        User user = userservice.getUserByEmail(userEmail);
        Room room = getRoomByCode(roomCode);
        room.getParticipants().remove(user);
        return roomRepository.save(room);
    }

    /** Mark the room as enabled */
    @Transactional
    public Room endRoom(String roomCode) {
        Room room = getRoomByCode(roomCode);
        room.setState(RoomState.ENDED);
        room.setEndedAt(LocalDateTime.now());
        return roomRepository.save(room);
    }

    /** Simple UUID-based code generator, retry until unique */
    private String generateUniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0,12);
        } while (roomRepository.findByRoomCode(code).isPresent());
        return code;
    }
}
