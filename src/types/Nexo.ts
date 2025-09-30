declare global {
  namespace nx {
    /**
     * Proxy factory and manager.
     */
    interface Nexo extends EventEmittable<NexoEvents & ProxyEvents> {
      /** Weak reference map of active proxies. */
      readonly entries: TraceableMap<Proxy>;
      /**
       * Retrieves an existing proxy by ID or creates one if it does not exist.
       *
       * @param id - Unique proxy identifier.
       * @param target - Optional target to wrap.
       */
      use(id: string, target?: Traceable): Proxy;
      /**
       * Creates a new proxy for the given target.
       *
       * @param target - Optional target to wrap.
       */
      create(target?: Traceable): Proxy;
    }
  }
}

export {};
