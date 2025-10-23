declare global {
  namespace nx {
    /** Fired when `Object.setPrototypeOf()` changes a proxy's prototype. */
    interface ProxySetPrototypeOfEvent extends ProxyEvent {
      readonly returnValue: void | object;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** New prototype object. */
        readonly prototype: object;
        /** Whether the prototype change succeeded. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
