declare global {
  namespace nx {
    /** Fired when the `in` operator is used on the proxy. */
    interface ProxyHasEvent extends ProxyEvent {
      readonly returnValue: boolean;
      readonly data: {
        /** Target object. */
        readonly target: Traceable;
        /** Property key checked for existence. */
        readonly property: ObjectKey;
        /** Whether the property exists. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
