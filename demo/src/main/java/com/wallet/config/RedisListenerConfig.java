package com.wallet.config;

import com.wallet.jobqueue.WalletQueueConsumer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisListenerConfig {

    private final WalletQueueConsumer walletQueueConsumer;

    public RedisListenerConfig(WalletQueueConsumer walletQueueConsumer) {
        this.walletQueueConsumer = walletQueueConsumer;
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(walletQueueConsumer, new PatternTopic("wallet-operations-queue"));
        return container;
    }
}
