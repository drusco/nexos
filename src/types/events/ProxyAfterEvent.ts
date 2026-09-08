declare global {
  namespace nx {
    /** Fired immediately after a proxy trap returns. */
    interface ProxyAfterEvent extends Event<Proxy> {
      readonly returnValue: void;
      readonly data: {
        /** The trap name that was executed. */
        readonly trap: keyof ProxyHandler<object>;
        /** The arguments the trap was invoked with. */
        readonly args: readonly unknown[];
        /** The synchronous value returned by the trap. */
        readonly result: unknown;
      };
    }
  }
}

export {};
