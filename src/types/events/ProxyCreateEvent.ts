declare global {
  namespace nx {
    /** Fired when a new proxy instance is created. */
    interface ProxyCreateEvent extends Event<object> {
      readonly returnValue: void;
      readonly data: {
        /** Unique proxy ID. */
        readonly id: string;
        /** Original proxy target. */
        readonly target: object;
      };
    }
  }
}

export {};
