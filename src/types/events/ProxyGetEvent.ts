declare global {
  namespace nx {
    /** Fired when a property is read from the proxy. */
    interface ProxyGetEvent extends ProxyEvent {
      readonly returnValue: unknown;
      readonly data: {
        /** Target object. */
        readonly target: Traceable;
        /** Property key being accessed. */
        readonly property: ObjectKey;
        /** Retrieved value. */
        readonly result: Promise<FunctionLike<[], unknown>>;
      };
    }
  }
}

export {};
