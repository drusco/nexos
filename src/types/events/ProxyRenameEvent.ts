declare global {
  namespace nx {
    /** Fired when a proxy name is changed. */
    interface ProxyRenameEvent extends Event<object> {
      readonly returnValue: void;
      readonly data: ProxyWrapper;
    }
  }
}

export {};
