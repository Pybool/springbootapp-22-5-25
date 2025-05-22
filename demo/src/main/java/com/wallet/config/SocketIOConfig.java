package com.wallet.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.wallet.socket.ChatConnectListener;

import jakarta.annotation.PreDestroy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin
@Configuration
public class SocketIOConfig {

    private SocketIOServer server;

    @Autowired
    private ChatConnectListener chatConnectListener;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("0.0.0.0");
        config.setPort(8200);
        server = new SocketIOServer(config);
        server.addListeners(chatConnectListener);
        server.start();
        return server;
    }

    @PreDestroy
    public void stopSocketIOServer() {
        if (server != null) {
            server.stop();
        }
    }

}
