package com.wallet.socket;

import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DisconnectListener;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ChatDisconnectListener implements DisconnectListener {

    @Override
    public void onDisconnect(SocketIOClient client) {
        log.info("Disconnected user : {}",client.getSessionId().toString());
    }

}