declare global {
  namespace nx {
    /** Fired when a property is deleted from the proxy. */
    interface ProxyDeletePropertyEvent extends ProxyEvent {
      readonly returnValue: void;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Property key being deleted. */
        readonly property: ObjectKey;
        /** Whether the deletion succeeded. */
        readonly result: Promise<FunctionLike<[], boolean>>;
      };
    }
  }
}

export {};
