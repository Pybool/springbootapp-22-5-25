package com.wallet.utils;

import java.security.SecureRandom;

public class Helpers {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateReferenceCode(String prefix) {
        String randomString = generateRandomString(8);
        String timestamp = Long.toString(System.currentTimeMillis(), 36);
        String last4OfTimestamp = timestamp.length() > 4 ? timestamp.substring(timestamp.length() - 4) : timestamp;
        return (prefix + randomString + last4OfTimestamp).toUpperCase();
    }

    private static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
