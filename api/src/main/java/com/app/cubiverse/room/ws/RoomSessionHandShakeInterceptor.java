package com.app.cubiverse.room.ws;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.app.cubiverse.room.repository.RoomSessionRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

public class RoomSessionHandShakeInterceptor implements HandshakeInterceptor {
    private final RoomSessionRepository sessions;

    public RoomSessionHandShakeInterceptor(RoomSessionRepository sessions) { this.sessions = sessions;}

    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes){
        if (request instanceof ServletServerHttpRequest httpReq) {
            HttpServletRequest r = httpReq.getServletRequest();
            String roomCode = r.getParameter("room");
            if (roomCode == null) return false;

            String cookieName = "roomSession." + roomCode;
            Cookie[] cookies = r.getCookies();
            if (cookies == null) return false;

            for (Cookie c : cookies) {
                if (cookieName.equals(c.getName())) {
                    var opt = sessions.findById(c.getValue());
                    if (opt.isPresent() && opt.get().getRoomCode().equals(roomCode) && opt.get().getExpiresAt().isAfter(Instant.now())) {
                        attributes.put("roomCode", roomCode);
                        attributes.put("roomSessionId", c.getValue());
                        attributes.put("displayName", opt.get().getDisplayName());
                        attributes.put("userId", opt.get().getUserId());
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {}
}
