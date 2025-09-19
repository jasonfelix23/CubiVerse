package com.app.cubiverse.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.app.cubiverse.room.repository.RoomSessionRepository;
import com.app.cubiverse.room.ws.GameWebSocketHandler;
import com.app.cubiverse.room.ws.RoomSessionHandShakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final GameWebSocketHandler gameWsHandler;
    private final RoomSessionRepository roomSessionRepository;

    public WebSocketConfig(GameWebSocketHandler gameWsHandler, RoomSessionRepository roomSessionRepository) {
        this.gameWsHandler = gameWsHandler;
        this.roomSessionRepository = roomSessionRepository;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gameWsHandler, "/ws")
        .addInterceptors(new RoomSessionHandShakeInterceptor(roomSessionRepository))
        .setAllowedOrigins("*");
    }
}
