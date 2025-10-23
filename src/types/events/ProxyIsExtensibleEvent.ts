declare global {
  namespace nx {
    /** Fired when checking if the proxy is extensible. */
    interface ProxyIsExtensibleEvent extends ProxyEvent {
      readonly returnValue: void | boolean;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Whether the object is extensible. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
