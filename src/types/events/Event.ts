declare global {
  namespace nx {
    /**
     * Describes an event with metadata and methods to control its behavior.
     *
     * @typeParam T - Event target type.
     * @typeParam D - Event data type.
     */
    interface Event<T = unknown, D = unknown> {
      /** Event name. */
      readonly name: string;
      /** Event payload data. */
      readonly data: D;
      /** Target the event was dispatched to. */
      readonly target: T;
      /** Timestamp when the event was created. */
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
