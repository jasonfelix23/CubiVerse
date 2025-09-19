package com.app.cubiverse.room.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.cubiverse.room.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String roomCode);
}
