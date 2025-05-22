package com.wallet.jobqueue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.dtos.WalletJobDTO;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class WalletQueueProducer {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public WalletQueueProducer(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public void walletBalanceUpdateJob(WalletJobDTO job) {
        try {
            String json = objectMapper.writeValueAsString(job);
            redisTemplate.convertAndSend("wallet-operations-queue", json);
            System.out.println("Published job to Redis: " + json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
