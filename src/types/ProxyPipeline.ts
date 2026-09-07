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
     * A middleware that runs before a proxy trap handler.
     *
     * @typeParam T - The pipeline context type.
     *
     * @remarks
     * Calling `next()` continues the chain and returns its result. `next(value)`
     * threads `value` down the chain, replacing the trap's return value. Returning
     * without calling `next()` short-circuits the chain with the returned value.
     * A middleware may be synchronous or asynchronous (`await next()`); its result
     * may be a plain value or a `Promise`. Middlewares execute in registration order.
     */
    type ProxyMiddleware<T> = <K extends keyof ProxyHandler<object>>(
      context: ProxyMiddlewareContext<T, K>,
      next: (
        value?: ReturnType<ProxyHandler<object>[K]>,
      ) => MaybePromise<ReturnType<ProxyHandler<object>[K]>>,
    ) => MaybePromise<ReturnType<ProxyHandler<object>[K]>>;

    /**
     * Options controlling how a middleware is registered in a pipeline.
     */
    type ProxyMiddlewareOptions = {
      /**
       * Marks the middleware as an invariant that always runs before any
       * non-protected middleware and cannot be removed, reordered, or bypassed.
       */
      protected?: boolean;
      /**
       * Restricts the middleware to the given trap(s). When omitted, the
       * middleware applies to every trap.
       */
      traps?: ReadonlyArray<keyof ProxyHandler<object>>;
    };

    /**
     * A named or anonymous middleware entry within a pipeline.
     *
     * @typeParam T - The pipeline context type.
     */
    type ProxyMiddlewareEntry<T> = {
      name?: string;
      /** Whether the entry is protected against removal and reordering. */
      protected?: boolean;
      /** The traps this middleware is scoped to (all traps when omitted). */
      traps?: ReadonlyArray<keyof ProxyHandler<object>>;
      middleware: ProxyMiddleware<T>;
    };

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
    interface ProxyPipeline<T extends object> {
      /** Appends a middleware. */
      use(middleware: ProxyMiddleware<T>): this;
      /** Appends a named middleware. */
      use(name: string, middleware: ProxyMiddleware<T>): this;
      /** Appends a protected middleware. */
      use(
        middleware: ProxyMiddleware<T>,
        options: ProxyMiddlewareOptions,
      ): this;
      /** Appends a named protected middleware. */
      use(
        name: string,
        middleware: ProxyMiddleware<T>,
        options: ProxyMiddlewareOptions,
      ): this;
      /** Prepends a middleware. */
      prepend(middleware: ProxyMiddleware<T>): this;
      /** Prepends a named middleware. */
      prepend(name: string, middleware: ProxyMiddleware<T>): this;
      /**
       * Inserts a middleware immediately before the middleware identified by
       * `target` (a name or a reference).
       *
       * @throws If `target` is not found or is a protected middleware.
       */
      insertBefore(
        target: ProxyMiddleware<T> | string,
        middleware: ProxyMiddleware<T>,
      ): this;
      /**
       * Inserts a middleware immediately after the middleware identified by
       * `target` (a name or a reference).
       *
       * @throws If `target` is not found.
       */
      insertAfter(
        target: ProxyMiddleware<T> | string,
        middleware: ProxyMiddleware<T>,
      ): this;
      /** Removes a middleware by reference. */
      remove(middleware: ProxyMiddleware<T>): this;
      /** Removes a middleware by name. */
      remove(name: string): this;
      /** Returns a builder that wraps trap handlers with the middlewares. */
      wrap(context: T): ProxyTrapBuilder<T>;
    }
  }
}

export {};
