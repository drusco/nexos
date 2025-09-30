declare global {
  namespace nx {
    /** Map of event names to data for {@link Nexo} events. */
    type NexoEvents = {
      proxy: {
        args: [ProxyCreateEvent];
        result: ProxyCreateEvent["returnValue"];
      };
      error: { args: [Error] };
    };
  }
}

export {};
