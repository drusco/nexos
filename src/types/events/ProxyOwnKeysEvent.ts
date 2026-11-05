declare global {
  namespace nx {
    /** Fired when the proxy's own property keys are requested. */
    interface ProxyOwnKeysEvent extends Event<Proxy> {
      readonly returnValue: ObjectKey[];
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** List of keys. */
        readonly result: Promise<FunctionLike<[], ObjectKey[]>>;
      };
    }
  }
}

export {};
