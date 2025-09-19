package com.app.cubiverse.room.ws;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper mapper = new ObjectMapper();

    //roomCode -> connections
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    //sessionId -> lightweight info
    private final Map<String, ClientInfo> clients = new ConcurrentHashMap<>();

    private record ClientInfo(String roomCode, String sessionId, String displayName, String userId) {}

    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String room = attr(session, "roomCode");
        String sid = attr(session, "roomSessionId");
        String displayName = attr(session, "displayName");
        String userId = attr(session, "userId");

        rooms.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(session);
        clients.put(session.getId(), new ClientInfo(room, sid, displayName, userId));

        //announce join 
        broadcast(room, obj()
        .put("t", "joined")
        .put("id", sid)
        .put("name", displayName == null ? "Guest" : displayName));

        var roster = mapper.createArrayNode();
        for (WebSocketSession s: rooms.getOrDefault(room, Set.of())) {
            var ci = clients.get(s.getId());
            if (ci != null) {
                roster.add(obj().put("id", ci.sessionId()).put("name", displayName == null ? "Guest" : ci.displayName()));
            }
        }
        session.sendMessage(new TextMessage(
            obj()
                .put("t", "welcome")
                .put("room", room)
                .put("id", sid)
                .put("name", displayName == null ? "Guest" : displayName)
                .set("roster", roster) 
                .toString()
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode root = mapper.readTree(message.getPayload());
        String t = root.path("t").asText();

        var info = clients.get(session.getId());
        if (info == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        switch (t) {
            case "join" -> {
                session.sendMessage(new TextMessage(json(
                    "t", "welcome", "room", info.roomCode(), "id", info.sessionId(), "name", info.displayName() == null ? "Guest": info.displayName()
                )));
            }
            case "move" -> {
                double tx = root.path("tx").asDouble();
                double ty = root.path("ty").asDouble();
                String f = root.path("f").asText(null);
                System.out.println("Someone from the team is moving " + info.displayName() + " tx: " + tx + " ty: " + ty + " f: " + f );
                broadcast(info.roomCode(), obj()
                    .put("t", "move")
                    .put("id", info.sessionId())
                    .put("tx", tx)
                    .put("ty", ty)
                    .put("f", f)
                );
            }
            case "chat" -> {
                String text = root.path("text").asText("");
                if (!text.isBlank()) {
                    broadcast(info.roomCode(), obj()
                        .put("t", "chat")
                        .put("id", info.sessionId())
                        .put("name", info.displayName() == null ? "Guest" : info.displayName())
                        .put("text", text)
                        .put("at", Instant.now().toEpochMilli()));
                    }
                }
                default -> session.sendMessage(new TextMessage(json("t", "error", "msg", "unknown type: " + t)));
            }
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
            safeClose(session, CloseStatus.SERVER_ERROR);
        }    

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            var info = clients.remove(session.getId());
            if (info == null) return;

            var set = rooms.get(info.roomCode());
            if (set != null) {
                set.remove(session);
                if (set.isEmpty()) rooms.remove(info.roomCode());
            }

            broadcast(info.roomCode(), obj()
                .put("t", "left")
                .put("id", info.sessionId()));
        }
    

    // ---------------------------- HELPERS ---------------------------
    private String attr(WebSocketSession s, String key) {
        Object v = s.getAttributes().get(key);
        return v == null ? null : String.valueOf(v);
    }

    private void broadcast(String room, ObjectNode json) {
        var set = rooms.get(room);
        if (set == null | set.isEmpty()) return;

        var msg = new TextMessage(json.toString());
        System.out.println(msg);
        for( WebSocketSession s: set) {
            try {
                if (s.isOpen()) s.sendMessage(msg);
            } catch (IOException ignored) { }
        }
    }

    private void safeClose(WebSocketSession s, CloseStatus status) {
        try { s.close(status); } catch (IOException ignored) {}
    }

    private String json(Object... kv) throws JsonProcessingException{
        var node = mapper.createObjectNode();
        for (int i = 0; i + 1 < kv.length; i+=2) {
            String k = String.valueOf(kv[i]);
            Object v = kv[i+1];
            if (v == null) { node.putNull(k); continue; }
            if (v instanceof Number n) node.put(k, n.doubleValue());
            else if (v instanceof Boolean b) node.put(k, b.booleanValue());
            else node.put(k, String.valueOf(v));
        }
        return mapper.writeValueAsString(node);
    }

    private ObjectNode obj() {
        return mapper.createObjectNode();
    }
}
