/**
 * Composes proxy trap handlers with middleware.
 *
 * @remarks
 * Middlewares are executed synchronously before the trap handler, in registration
 * order. A middleware may call `next()` to continue the chain or skip it to
 * short-circuit the trap.
 *
 * @typeParam T - The context type shared by all middlewares (e.g. a proxy wrapper).
 */
export default class ProxyPipeline<
  T extends object,
> implements nx.ProxyPipeline<T> {
  private stack: nx.ProxyMiddleware<T>[] = [];

  use(middleware: nx.ProxyMiddleware<T>): void {
    this.stack.push(middleware);
  }

  wrap(context: T): nx.ProxyTrapBuilder<T> {
    return <K extends keyof ProxyHandler<object>>(
      trap: K,
      handler: (ctx: T) => nx.ProxyTrap<K>,
    ) => {
      let current = handler(context);

      for (let i = this.stack.length - 1; i >= 0; i--) {
        const middleware = this.stack[i];
        const prev = current;

        current = (...args: Parameters<ProxyHandler<object>[K]>) => {
          let nextCalled = false;

          const next = () => {
            nextCalled = true;
          };

          middleware({ context, trap, args }, next);

          // call the next middleware if next() is invoked
          if (nextCalled) {
            return prev(...args);
          }
        };
      }

      return current;
    };
  }
}
