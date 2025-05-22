
package com.wallet.socket;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MessageListener implements DataListener<Message> {

    private final SocketIOServer server;

    public MessageListener(SocketIOServer server) {
        this.server = server;
    }
    @EventListener
    public void onAppReady(ContextRefreshedEvent event) {
        server.addEventListener("sendMessage", Message.class, this);
        log.info("✅ Socket.IO message listener registered");
    }

    @Override
    public void onData(SocketIOClient client, Message message, AckRequest ackRequest) {
        log.info("📨 Received from {}: {}", client.getSessionId(), message);
        server.getBroadcastOperations().sendEvent("privateChatMessage", message);
    }
}

