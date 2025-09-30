declare global {
  namespace nx {
    /**
     * Wraps a proxy instance, manages events, and handles lifecycle operations.
     */
    interface ProxyWrapper extends EventEmittable<ProxyEvents> {
      /** The underlying target object */
      readonly target: Traceable;
      /** The unique identifier for the proxy */
      readonly id: string;
      /** The proxy manager instance. */
      readonly nexo?: Nexo;
      /** Whether the proxy has been revoked. */
      readonly revoked: boolean;
      /** Whether the `proxy` was created with a custom target object */
      readonly traceable: boolean;
      /** Revokes the proxy, making it unusable. */
      revoke(): void;
      /** Sets the proxy manager instance  */
      setManager(manager: Nexo): this;
      /** Removes the proxy manager instance  */
      removeManager(): this;
      /** Sets the underlying proxy target */
      setTarget(target: Traceable, isTraceable?: boolean): this;
      /** Sets the unique identifier for the proxy */
      setId(id: string): this;
    }
  }
}

export {};
