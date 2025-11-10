declare global {
  namespace nx {
    interface EventEmittable<Events extends EventMap = EventMap> {
      /** The event emitter instance responsible for managing lifecycle events. */
      readonly events?: EventEmitter<Events>;
      /**
       * Attaches an {@link EventEmitter} to handle lifecycle events.
       *
       * @param emitter - The event emitter instance to attach.
       * @returns The current instance, for method chaining.
       */
      setEventEmitter(emitter: EventEmitter): this;
      /** Detaches the current event emitter.
       *
       * * @returns The current instance, for method chaining.
       */
      removeEventEmitter(): this;
    }
  }
}

export {};
