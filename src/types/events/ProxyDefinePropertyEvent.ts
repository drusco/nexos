declare global {
  namespace nx {
    /** Fired when `Object.defineProperty()` is used on the proxy. */
    interface ProxyDefinePropertyEvent extends Event<Proxy> {
      readonly returnValue: void | PropertyDescriptor;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Property key being defined. */
        readonly property: ObjectKey;
        /** Property descriptor being applied. */
        readonly descriptor: PropertyDescriptor;
        /** Whether the definition succeeded. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
