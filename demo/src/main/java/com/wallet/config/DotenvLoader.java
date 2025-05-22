package com.wallet.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DotenvLoader {

    private static final Logger log = LoggerFactory.getLogger(DotenvLoader.class);

    @PostConstruct
    public void loadEnv() {
        Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
            log.info("[ENV] Loaded: {} = {}", entry.getKey(), entry.getValue());
        });
    }
}
