declare global {
  namespace nx {
    /**
     * A minimal event emitter interface for registering, removing,
     * and invoking event listeners.
     */
    interface EventEmitter<Events extends EventMap = EventMap> {
      /**
       * Registers a listener for a specific event.
       *
       * @param event - The name of the event to listen to.
       * @param listener - The function to invoke when the event is emitted.
       * @returns The current emitter instance, for method chaining.
       */
      on<Name extends keyof Events>(
        event: Name,
        listener: (
          ...args: Parameters<Events[Name]>
        ) => ReturnType<Events[Name]>,
      ): this;

      /**
       * Removes a previously registered listener for a specific event.
       *
       * @param event - The name of the event.
       * @param listener - The listener function to remove.
       * @returns The current emitter instance, for method chaining.
       */
      off<Name extends keyof Events>(
        event: Name,
        listener: (
          ...args: Parameters<Events[Name]>
        ) => ReturnType<Events[Name]>,
      ): this;

      /**
       * Emits an event to all registered listeners.
       *
       * @param event - The name of the event to emit.
       * @param data - The Event or Error payload passed to the listeners.
       * @returns `true` if one or more listeners were invoked, `false` otherwise.
       */
      emit<Name extends keyof Events>(
        event: Name,
        data: Parameters<Events[Name]>[0],
      ): boolean;

      /**
       * Emits an event and asynchronously triggers all associated listeners.
       *
       * @remarks
       * Unlike {@link emit}, this method awaits each listener in registration
       * order, so `async` listeners can perform asynchronous work and still
       * contribute to the event's `returnValue`.
       *
       * @param event - The name of the event to emit.
       * @param data - The Event or Error payload passed to the listeners.
       * @returns A promise resolving to `true` if one or more listeners were invoked, `false` otherwise.
       */
      emitAsync<Name extends keyof Events>(
        event: Name,
        data: Parameters<Events[Name]>[0],
      ): Promise<boolean>;
    }
  }
}

export {};
