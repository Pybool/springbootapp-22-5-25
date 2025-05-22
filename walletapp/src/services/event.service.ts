import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventSubject = new Subject<any>(); // Subject to emit data

  // Method to emit events
  emitEvent(data: any) {
    this.eventSubject.next(data);
  }

  // Observable to listen for events
  get events$() {
    return this.eventSubject.asObservable();
  }
}
