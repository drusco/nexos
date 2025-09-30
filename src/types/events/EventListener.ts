declare global {
  namespace nx {
    interface EventListener {
      /** The arguments passed to the event listener. */
      args: unknown[];
      /** The value returned by the event listener, if any. */
      result?: unknown;
    }
  }
}

export {};
