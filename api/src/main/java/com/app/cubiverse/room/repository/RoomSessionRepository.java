package com.app.cubiverse.room.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.cubiverse.room.entity.RoomSession;

public interface RoomSessionRepository extends JpaRepository<RoomSession, String> {
    
}
