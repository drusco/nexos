declare global {
  namespace nx {
    /** Fired when a proxy manager is changed. */
    interface ProxyManagerEvent extends Event<object> {
      readonly returnValue: void;
      readonly data: ProxyWrapper;
    }
  }
}

export {};
