declare global {
  namespace nx {
    /** Fired when the proxy's own property keys are requested. */
    interface ProxyOwnKeysEvent extends ProxyEvent {
      readonly returnValue: ObjectKey[];
      readonly data: {
        /** Target object. */
        readonly target: Traceable;
        /** List of keys. */
        readonly result: Promise<FunctionLike<[], ObjectKey[]>>;
      };
    }
  }
}

export {};
