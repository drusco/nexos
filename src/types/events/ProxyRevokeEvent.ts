declare global {
  namespace nx {
    /** Fired when a proxy is revoked. */
    interface ProxyRevokeEvent extends Event<null> {
      readonly returnValue: void;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** The proxy ID. */
        readonly id: string;
      };
    }
  }
}

export {};
