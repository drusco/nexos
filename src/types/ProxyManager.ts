declare global {
  namespace nx {
    /** Proxy factory and manager. */
    interface ProxyManager<
      Events extends EventMap = EventMap,
    > extends EventEmittable<Events> {
      /** Reference of managed proxies. */
      readonly entries?: Map<string, WeakRef<object>>;
      /**
       * Retrieves an existing proxy by ID or creates one if it does not exist.
       *
       * @param id - Unique proxy identifier.
       * @param target - Optional target to wrap.
       */
      use(id: string, target?: object): object;
      /**
       * Creates a new proxy for the given target.
       *
       * @param target - Optional target to wrap.
       */
      create(target?: object): object;
    }
  }
}

export {};
