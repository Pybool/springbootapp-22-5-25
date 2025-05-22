// SDK/core/events/event-bus.ts
import { Subject, Subscription } from 'rxjs';

export interface RayEvent {
  type: string;
  payload: any;
}

export const RxEventBus = new Subject<RayEvent>();

// Later: call this when you want to clean up
export function cleanRxEventBus(eventSubscription:Subscription) {
  if (eventSubscription?.unsubscribe) {
    eventSubscription.unsubscribe();
    console.log("🧹 RxEventBus subscription cleaned up");
  }
}

