package com.wallet.socket;

import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.slf4j.Slf4j;

import static com.wallet.socket.ChatConnectListener.connectedClients;

import java.util.Map;

@Slf4j
@Service
public class SocketMessaging {

    public void sendMessage(String userId, Map<String, Object> message) throws JsonProcessingException {
        SocketIOClient client = connectedClients.get(userId);
        if (client != null && client.isChannelOpen()) {
           ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());

            String jsonString = mapper.writeValueAsString(message);

            client.sendEvent("notification", jsonString);
            log.warn("[MESSAGE SENT] Message was sent to user {}", userId);
        } else {
            log.warn("[MESSAGE FAILED] Could not send message. User {} not connected.", userId);
        }
    }
}
