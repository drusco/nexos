declare global {
  namespace nx {
    /** Fired when a proxy-wrapped constructor is called via `new`. */
    interface ProxyConstructEvent extends Event<Proxy> {
      readonly returnValue: object;
      readonly data: {
        /** Constructor function being called. */
        readonly target: object;
        /** Arguments passed to the constructor. */
        readonly args: unknown[];
        /** Resulting instance from the constructor. */
        readonly result: Promise<FunctionLike<[], object>>;
      };
    }
  }
}

export {};
