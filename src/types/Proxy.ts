/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  namespace nx {
    type proxy = {
      /** Allow custom properties on sandboxed proxies. */
      [K: ObjectKey]: any;

      /** Overwrite read-only property type definitions. */
      name: any;
      apply: any;
      bind: any;
      call: any;
      caller: any;
      length: any;
      toString: any;

      /**
       * Callable signature for sandboxed proxies.
       * Arguments and return value types can be set as parameters.
       *
       * @typeParam Args - Function argument types.
       * @typeParam Return - Return type of the call.
       */
      <Args extends unknown[] = unknown[], Return = proxy>(
        ...args: Args
      ): Return;

      /**
       * Constructor signature for sandboxed proxies.
       * * Arguments and instance types can be set as parameters.
       *
       * @typeParam Args - Constructor argument types.
       * @typeParam Instance - Instance type returned by `new`.
       */
      new <Args extends unknown[] = unknown[], Instance extends object = proxy>(
        ...args: Args
      ): Instance;
    };

    /** A proxy-wrapped object or function. */
    type Proxy<target extends object = undefined> = target extends undefined
      ? proxy
      : target extends FunctionLike
        ? target & {
            /** Allow custom properties on function targets */
            [K: ObjectKey]: any;
          }
        : target;
  }
}

export {};
