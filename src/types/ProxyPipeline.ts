declare global {
  namespace nx {
    /**
     * The function signature of a single proxy trap.
     *
     * @typeParam K - The proxy trap name (e.g. `get`, `set`, `apply`).
     */
    type ProxyTrap<K extends keyof ProxyHandler<object>> = (
      ...args: Parameters<ProxyHandler<object>[K]>
    ) => ReturnType<ProxyHandler<object>[K]>;

    /**
     * The context passed to a {@link ProxyMiddleware} for a given trap.
     *
     * @typeParam T - The pipeline context type (e.g. a proxy wrapper).
     * @typeParam K - The proxy trap name.
     */
    type ProxyMiddlewareContext<T, K extends keyof ProxyHandler<object>> = {
      /** The context the pipeline was bound to. */
      context: T;
      /** The trap name currently being executed. */
      trap: K;
      /** The arguments the trap was invoked with. */
      args: Parameters<ProxyHandler<object>[K]>;
    };

    /**
     * A middleware that runs synchronously before a proxy trap handler.
     *
     * @typeParam T - The pipeline context type.
     *
     * @remarks
     * Calling `next()` continues the chain; skipping it short-circuits the trap.
     * Middlewares execute in registration order.
     */
    type ProxyMiddleware<T> = <K extends keyof ProxyHandler<object>>(
      context: ProxyMiddlewareContext<T, K>,
      next: () => void,
    ) => void;

    /**
     * Builds a trap handler wrapped by the pipeline middlewares.
     *
     * @typeParam T - The pipeline context type.
     */
    type ProxyTrapBuilder<T> = <K extends keyof ProxyHandler<object>>(
      trap: K,
      handler: (context: T) => ProxyTrap<K>,
    ) => ProxyTrap<K>;

    /**
     * A composable pipeline of proxy middleware.
     *
     * @typeParam T - The pipeline context type.
     */
    interface ProxyPipe<T extends object> {
      /** Registers a middleware. */
      use(middleware: ProxyMiddleware<T>): void;
      /** Returns a builder that wraps trap handlers with the middlewares. */
      wrap(context: T): ProxyTrapBuilder<T>;
    }
  }
}

export {};
