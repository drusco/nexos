declare global {
  namespace nx {
    /** Map of available {@link ProxyManager} event names. */
    type ManagerEvents = {
      proxy: (event: ProxyCreateEvent) => ProxyCreateEvent["returnValue"];
      error: (event: Error) => void;
    };
  }
}

export {};
