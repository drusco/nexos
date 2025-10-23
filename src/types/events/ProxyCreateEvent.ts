declare global {
  namespace nx {
    /** Fired when a new proxy instance is created. */
    interface ProxyCreateEvent extends ProxyEvent {
      readonly returnValue: void | Proxy;
      readonly data: {
        /** Unique proxy ID. */
        readonly id: string;
        /** Original proxy target. */
        readonly target: object;
        /** Newly created proxy instance. */
        readonly result: Promise<FunctionLike<[], Proxy>>;
      };
    }
  }
}

export {};
