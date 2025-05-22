import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmitterService {
  private actionEmitterObs: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actionEmitter: EventEmitter<any> = new EventEmitter<any>();
  payloadEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  setActionEmitterObs(data:any){
    this.actionEmitterObs.next(data)
  }

  getActionEmitterObs(): Observable<any> {
    return this.actionEmitterObs.asObservable();
  }
}
