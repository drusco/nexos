declare global {
  namespace nx {
    /**
     * Describes an event with metadata and methods to control its behavior.
     *
     * @typeParam Target - Event target type.
     * @typeParam Data - Event data type.
     */
    interface Event<Target = unknown, Data = unknown> {
      /** Event name. */
      readonly name: string;
      /** Event payload data. */
      readonly data: Data;
      /** Target the event was dispatched to. */
      readonly target: Target;
      /** Timestamp when the event was created (ms since epoch). */
      readonly timestamp: number;
      /** Whether the event can be canceled. */
      readonly cancelable: boolean;
      /** Whether the default action was prevented. */
      readonly defaultPrevented: boolean;
      /** Value assigned after the event is processed. */
      returnValue: unknown;
      /** Prevents the default action if the event is cancelable. */
      preventDefault(): void;
    }
  }
}

export {};
