declare global {
  namespace nx {
    /** A proxy-wrapped object or function. */
    interface Proxy {
      [key: ObjectKey]: unknown;
      name: unknown;
      apply: unknown;
      bind: unknown;
      call: unknown;
      caller: unknown;
      length: unknown;
      toString: unknown;
      /**
       * Constructor signature for the proxy.
       *
       * @typeParam Args - Constructor argument types.
       * @typeParam Instance - Instance type returned by `new`.
       */
      new <
        Args extends unknown[] = unknown[],
        Instance extends Traceable = Proxy,
      >(
        ...args: Args
      ): Instance;
      /**
       * Callable signature for the proxy.
       *
       * @typeParam Args - Function argument types.
       * @typeParam Return - Return type of the call.
       */
      <Args extends unknown[] = unknown[], Return = Proxy>(
        ...args: Args
      ): Return;
    }
  }
}

export {};
