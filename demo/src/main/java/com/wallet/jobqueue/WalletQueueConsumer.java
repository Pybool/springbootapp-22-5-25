
package com.wallet.jobqueue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.dtos.WalletJobDTO;
import com.wallet.services.WalletService;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
public class WalletQueueConsumer implements MessageListener {

    private final WalletService walletService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WalletQueueConsumer(WalletService walletService) {
        this.walletService = walletService;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody());
            WalletJobDTO job = objectMapper.readValue(json, WalletJobDTO.class);
            System.out.println("Received job from Redis: " + json);
            walletService.UpdateWalletBalance(job);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

