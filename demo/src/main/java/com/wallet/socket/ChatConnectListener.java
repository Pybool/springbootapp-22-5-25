package com.wallet.socket;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.wallet.utils.JwtUtil;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ChatConnectListener {

    @Autowired
    private JwtUtil jwtUtil;

    public static final ConcurrentHashMap<String, SocketIOClient> connectedClients = new ConcurrentHashMap<>();

    @OnConnect
    public void onConnect(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        boolean isValidToken = jwtUtil.validateToken(token);
        if (!isValidToken) {
            log.warn("[UNAUTHORIZED] Invalid token attempt from IP: {}, SessionID: {}", client.getRemoteAddress(),
                    client.getSessionId());
            client.sendEvent("unauthorized", "Invalid token");
            client.disconnect(); 
            return;

        }
        String ip = client.getRemoteAddress().toString();
        String userId = jwtUtil.getUserIdFromToken(token);
        connectedClients.put(userId, client);
        log.info("[CONNECTED] Client connected from IP: {}, Token: {}, SessionID: {}", ip, token,
        client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        connectedClients.entrySet().removeIf(entry -> entry.getValue().getSessionId().equals(client.getSessionId()));
        log.info("[DISCONNECTED] Client disconnected: SessionID: {}", client.getSessionId());
    }
}
