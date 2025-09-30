declare global {
  namespace nx {
    /**
     * A minimal event emitter interface for registering, removing,
     * and invoking event listeners.
     */
    interface EventEmitter<
      Events extends Record<string, EventListener> = Record<
        string,
        EventListener
      >,
    > {
      /**
       * Registers a listener for a specific event.
       *
       * @param event - The name of the event to listen to.
       * @param listener - The function to invoke when the event is emitted.
       * @returns The current emitter instance, for method chaining.
       */
      on<Name extends keyof Events>(
        event: Name,
        listener: (...args: Events[Name]["args"]) => Events[Name]["result"],
      ): this;

      on(event: string, listener: FunctionLike): this;

      /**
       * Removes a previously registered listener for a specific event.
       *
       * @param event - The name of the event.
       * @param listener - The listener function to remove.
       * @returns The current emitter instance, for method chaining.
       */
      off<Name extends keyof Events>(
        event: Name,
        listener: (...args: Events[Name]["args"]) => Events[Name]["result"],
      ): this;

      off(event: string, listener: FunctionLike): this;

      /**
       * Emits an event to all registered listeners.
       *
       * @param event - The name of the event to emit.
       * @param data - The arguments passed to the listeners.
       * @returns `true` if one or more listeners were invoked, `false` otherwise.
       */
      emit<Name extends keyof Events>(
        event: Name,
        ...data: Events[Name]["args"]
      ): boolean;

      emit(event: string, ...data: unknown[]): boolean;
    }
  }
}

export {};
