declare global {
  namespace nx {
    /** Fired when a proxy wrapper value changes. */
    interface ProxyWrapperEvent extends Event {
      readonly target: object;
      readonly returnValue: void;
      readonly data: ProxyWrapper;
    }
  }
}

export {};
