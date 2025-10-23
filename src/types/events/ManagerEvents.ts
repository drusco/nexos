declare global {
  namespace nx {
    /** Map of available {@link nx.ProxyManager} event names. */
    type ManagerEvents = {
      proxy: {
        args: [ProxyCreateEvent];
        result: ProxyCreateEvent["returnValue"];
      };
      error: { args: [Error] };
    };
  }
}

export {};
