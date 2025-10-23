declare global {
  namespace nx {
    /** Fired when a proxy's prototype is retrieved. */
    interface ProxyGetPrototypeOfEvent extends ProxyEvent {
      readonly returnValue: object;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Prototype of the target object. */
        readonly result: Promise<FunctionLike<[], object>>;
      };
    }
  }
}

export {};
