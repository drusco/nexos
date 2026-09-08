declare global {
  namespace nx {
    /** Fired immediately before a proxy trap is executed. */
    interface ProxyBeforeEvent extends Event<Proxy> {
      readonly returnValue: void;
      readonly data: {
        /** The trap name being executed. */
        readonly trap: keyof ProxyHandler<object>;
        /** The arguments the trap was invoked with. */
        readonly args: readonly unknown[];
      };
    }
  }
}

export {};
