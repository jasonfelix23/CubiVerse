package com.app.cubiverse.room.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.app.cubiverse.auth.entity.User;
import com.app.cubiverse.room.entity.enums.RoomState;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name="room_code", unique = true, nullable= false)
    private String roomCode;

    @ManyToOne(optional = false)
    @JoinColumn(name = "host_id")
    private User host;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime endedAt;

    @Enumerated(EnumType.STRING)
    private RoomState state;

    @Column(name = "chat_enabled")
    private boolean chatEnabled = true;

    @Column(name = "audio_enabled")
    private boolean audioEnabled = true;

    @Column(name = "video_enabled")
    private boolean videoEnabled = true;

    @Column(name = "npc_enabled")         
    private boolean npcEnabled = false;     

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @ManyToMany
    @JoinTable(
        name = "room_participants",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    
    private Set<User> participants = new HashSet<>();

}
