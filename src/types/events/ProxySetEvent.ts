declare global {
  namespace nx {
    /** Fired when a property is set on the proxy. */
    interface ProxySetEvent extends Event<Proxy> {
      readonly returnValue: unknown;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Property key being set. */
        readonly property: ObjectKey;
        /** New value being assigned. */
        readonly value: unknown;
        /** Whether the set succeeded. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
