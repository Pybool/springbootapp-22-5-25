package com.wallet.services;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.wallet.models.Notification;
import com.wallet.models.Wallet;
import com.wallet.models.WalletTransaction;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;
import com.wallet.repository.NotificationRepository;
import com.wallet.socket.SocketMessaging;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SocketMessaging socketMessaging;

    public Notification createNotification(String title, Wallet wallet, WalletTransaction walletTransaction)
            throws JsonProcessingException {
        Notification notification = new Notification();
        notification.setAccount(wallet.getAccount());
        notification.setTitle(title);

        WalletTransactionType type = walletTransaction.getType();
        WalletOperationType opType = walletTransaction.getOperationType();
        String username = wallet.getAccount().getUsername();
        BigDecimal amount = walletTransaction.getAmount().divide(BigDecimal.valueOf(100));// Convert to naira from kobo
        BigDecimal priorBalance = wallet.getPriorBalance();
        BigDecimal currentBalance = wallet.getBalance();

        String actionDescription;

        switch (type) {
            case WALLET_TRANSFER:
                actionDescription = (opType == WalletOperationType.CREDIT)
                        ? "received a wallet transfer"
                        : "sent a wallet transfer";
                break;

            case DIRECT_TOPUP:
                actionDescription = (opType == WalletOperationType.CREDIT)
                        ? "received a direct top-up"
                        : "had a direct top-up reversed";
                break;

            case PAYOUT_TOPUP:
                actionDescription = (opType == WalletOperationType.CREDIT)
                        ? "received a payout top-up"
                        : "had a payout reversed";
                break;

            case WALLET_WITHDRAWAL:
                actionDescription = (opType == WalletOperationType.DEBIT)
                        ? "made a wallet withdrawal"
                        : "had a wallet withdrawal reversed";
                break;

            case WALLET_BALANCE_PAYMENT:
            case EXTERNAL_WALLET_BALANCE_PAYMENT:
                actionDescription = (opType == WalletOperationType.DEBIT)
                        ? "made a payment using your wallet"
                        : "received a refund from a wallet payment";
                break;

            default:
                actionDescription = "performed a wallet transaction";
                break;
        }

        String message = String.format(
                "Hi %s,\n\nYou %s of amount %.2f.\n\nPrevious Balance: %.2f\nNew Balance: %.2f.",
                username,
                actionDescription,
                amount,
                priorBalance,
                currentBalance);

        notification.setMessage(message);
        notification.setCreatedAt(new Date());
        notification.setStatus("UNREAD");
        notification.setNotificationClass(opType == WalletOperationType.CREDIT ? "success" : "warning");
        String accountId = wallet.getAccount().getId();
        Map<String, Object> data = new HashMap<>();

        data.put("wallet", wallet);
        data.put("notification", notification);
        data.put("walletTransaction", walletTransaction);
        socketMessaging.sendMessage(accountId, data);
        return notificationRepository.save(notification);
    }

}
