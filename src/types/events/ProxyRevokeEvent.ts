declare global {
  namespace nx {
    /** Fired when a proxy is revoked. */
    interface ProxyRevokeEvent extends Event<object> {
      readonly returnValue: void;
      readonly data: ProxyWrapper;
    }
  }
}

export {};
