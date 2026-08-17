declare global {
  namespace nx {
    interface EventEmittable<Events extends EventMap = EventMap> {
      /** The event emitter instance responsible for managing lifecycle events. */
      readonly events: EventEmitter<Events>;
    }
  }
}

export {};
