package com.wallet.repository;

import com.wallet.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    List<Notification> findByAccountId(String accountId);

    List<Notification> findByStatus(String status);
    
    List<Notification> findByAccountIdAndStatus(String accountId, String status);
}
