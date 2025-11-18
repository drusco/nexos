declare global {
  namespace nx {
    /**
     * Wraps a proxy instance, manages events, and handles lifecycle operations.
     */
    interface ProxyWrapper<
      T extends object = object,
      Events extends EventMap = EventMap,
    > extends EventEmittable<Events> {
      /** The underlying target object */
      readonly target: T;
      /** The proxy reference */
      readonly proxy: object;
      /** The unique identifier for the proxy */
      readonly id: string;
      /** The proxy manager instance. */
      readonly manager?: ProxyManager;
      /** Whether the proxy has been locked. */
      readonly locked: boolean;
      /** Whether the `proxy` was created with a custom target object */
      readonly traceable: boolean;
      /** Locks the proxy, making it temporarily unusable. */
      lock(): this;
      /** Unlocks the proxy, making it usable again */
      unlock(): this;
      /** Sets the proxy manager instance  */
      setManager(manager: ProxyManager): this;
      /** Removes the proxy manager instance  */
      removeManager(): this;
      /** Sets the underlying proxy target */
      setTarget(target: object): this;
      /** Sets the unique identifier for the proxy */
      setId(id: string): this;
    }
  }
}

export {};
