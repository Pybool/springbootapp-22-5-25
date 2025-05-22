import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { BehaviorSubject, take } from 'rxjs';
import { environment } from '../environments/environment';
import { EventService } from './event.service';
import { RxEventBus } from './event-bus';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public notificationsIntervalId: any = null;
  public notifications: any[] = [];
  public unreadCount: number = 0;
  public notificationsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.notifications
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private eventService: EventService
  ) {}

  connectToSocket() {
    const _window: any = window as any;
    const io = _window.io;
    const token = this.tokenService.retrieveToken('javapp-accessToken');

    const socket = io('http://localhost:8200', {
      query: { token: token },
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socket.on('connect_error', (error: any) => {
      console.log('Failed to connect the server', error.toString());
    });

    socket.on('disconnect', (msg: any) => {
      console.log('Disconnected from the server ', msg);
    });

    socket.on('notification', (rawNotification: any) => {
      try {
        const data = JSON.parse(rawNotification);
        console.log('notification ', data);
        if (Notification.permission === "granted") {
          new Notification(data?.notification?.title || "Debit Alert!", {
            body: data?.notification?.message || "Debit Alert!",
            icon: 'https://uatmarketplace.crygoca.com/assets/_images/flutterwave-logo.png',
            requireInteraction: true
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(data.notification.title, {
                body: data.notification.message,
                icon: 'https://uatmarketplace.crygoca.com/assets/_images/flutterwave-logo.png',
                requireInteraction: true
              });
            }
          });
        }        
        RxEventBus.next({
          type: 'NOTIFICATION',
          payload: data,
        });
      } catch (error: any) {
        console.log(error);
      }
    });
  }

  fetchNotificationsObs(page: number, limit: number, filter: any = {}) {
    this.fetchNotifications(page, limit, filter)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.unreadCount = response.unreadCount;
            this.notifications = response.data;
            this.notificationsSubject.next(this.notifications);
          }
        },
        (error: any) => {
          console.log('Failed to fetch notifications');
        }
      );

    return this.notificationsSubject.asObservable();
  }

  updateNotifications(notification: any) {
    this.notifications.unshift(notification);
    this.notificationsSubject.next(this.notifications);
    this.unreadCount += 1;
  }

  fetchNotifications(page: number, limit: number, filter: any = {}) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        params = params.set(key, filter[key].toString());
      }
    });
    return this.http.get(
      `${environment.api}/api/v1/notifications/fetch-notifications`,
      { params }
    );
  }

  markNotification(payload: {
    notificationId: string;
    status: 'READ' | 'UNREAD';
  }) {
    return this.http.put(
      `${environment.api}/api/v1/notifications/mark-notification`,
      payload
    );
  }

  getNotificationById() {}
}
