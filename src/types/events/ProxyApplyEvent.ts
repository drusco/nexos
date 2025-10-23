declare global {
  namespace nx {
    /** Fired when a proxy-wrapped function is invoked. */
    interface ProxyApplyEvent extends ProxyEvent {
      readonly returnValue: unknown;
      readonly data: {
        /** Target function being called. */
        readonly target: object;
        /** `this` value for the call. */
        readonly thisArg: unknown;
        /** Arguments passed to the call. */
        readonly args: unknown[];
        /** Result of the call. */
        readonly result: Promise<FunctionLike<[], unknown>>;
      };
    }
  }
}

export {};
