declare global {
  namespace nx {
    /** Fired when `Object.preventExtensions()` is called on the proxy. */
    interface ProxyPreventExtensionsEvent extends ProxyEvent {
      readonly returnValue: void | boolean;
      readonly data: {
        /** Target object. */
        readonly target: Traceable;
        /** Whether preventing extensions succeeded. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
