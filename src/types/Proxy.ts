/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  namespace nx {
    interface Proxy {
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
       * @typeParam A - Function argument types.
       * @typeParam R - Return type of the call.
       */
      <A extends unknown[], R = Proxy>(...args: A): R;

      /**
       * Constructor signature for sandboxed proxies.
       * * Arguments and instance types can be set as parameters.
       *
       * @typeParam A - Constructor argument types.
       * @typeParam I - Instance type returned by `new`.
       */
      new <A extends unknown[], I extends object = Proxy>(...args: A): I;
    }
  }
}

export {};
