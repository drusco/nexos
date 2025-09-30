declare global {
  namespace nx {
    /** Fired when a proxy-wrapped constructor is called via `new`. */
    interface ProxyConstructEvent extends ProxyEvent {
      readonly returnValue: Traceable;
      readonly data: {
        /** Constructor function being called. */
        readonly target: Traceable;
        /** Arguments passed to the constructor. */
        readonly args: unknown[];
        /** Resulting instance from the constructor. */
        readonly result: Promise<FunctionLike<[], Traceable>>;
      };
    }
  }
}

export {};
