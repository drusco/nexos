declare global {
  namespace nx {
    /**
     * A minimal event emitter interface for registering, removing,
     * and invoking event listeners.
     */
    interface EventEmitter<
      Events extends Record<string, FunctionLike> = Record<
        string,
        FunctionLike
      >,
    > {
      /**
       * Registers a listener for a specific event.
       *
       * @param event - The name of the event to listen to.
       * @param listener - The function to invoke when the event is emitted.
       * @returns The current emitter instance, for method chaining.
       */
      on<Name extends Extract<keyof Events, string>>(
        event: Name,
        listener: (
          ...args: Parameters<Events[Name]>
        ) => ReturnType<Events[Name]>,
      ): this;

      on(event: string, listener: FunctionLike): this;

      /**
       * Removes a previously registered listener for a specific event.
       *
       * @param event - The name of the event.
       * @param listener - The listener function to remove.
       * @returns The current emitter instance, for method chaining.
       */
      off<Name extends Extract<keyof Events, string>>(
        event: Name,
        listener: (
          ...args: Parameters<Events[Name]>
        ) => ReturnType<Events[Name]>,
      ): this;

      off(event: string, listener: FunctionLike): this;

      /**
       * Emits an event to all registered listeners.
       *
       * @param event - The name of the event to emit.
       * @param data - The arguments passed to the listeners.
       * @returns `true` if one or more listeners were invoked, `false` otherwise.
       */
      emit<Name extends Extract<keyof Events, string>>(
        event: Name,
        ...data: Parameters<Events[Name]>
      ): boolean;
    }
  }
}

export {};
