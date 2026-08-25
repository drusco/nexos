/**
 * Composes proxy trap handlers with middleware.
 *
 * @remarks
 * Middlewares are executed synchronously before the trap handler, in registration
 * order. A middleware may call `next()` to continue the chain or skip it to
 * short-circuit the trap.
 *
 * A pipeline can extend a parent pipeline: the parent's middlewares run before the
 * pipeline's own middlewares and before the trap handler.
 *
 * @typeParam T - The context type shared by all middlewares (e.g. a proxy wrapper).
 */
export default class ProxyPipeline<
  T extends object,
> implements nx.ProxyPipeline<T> {
  private entries: nx.ProxyMiddlewareEntry<T>[] = [];
  private parent?: ProxyPipeline<T>;

  constructor(parent?: ProxyPipeline<T>) {
    this.parent = parent;
  }

  /** @internal Re-parents the pipeline (used when a proxy's manager changes). */
  setParent(parent?: ProxyPipeline<T>): this {
    this.parent = parent;
    return this;
  }

  use(middleware: nx.ProxyMiddleware<T>): this;
  use(name: string, middleware: nx.ProxyMiddleware<T>): this;
  use(
    middlewareOrName: nx.ProxyMiddleware<T> | string,
    middleware?: nx.ProxyMiddleware<T>,
  ): this {
    this.entries.push(
      typeof middlewareOrName === "string"
        ? {
            name: middlewareOrName,
            middleware: middleware as nx.ProxyMiddleware<T>,
          }
        : { middleware: middlewareOrName },
    );
    return this;
  }

  prepend(middleware: nx.ProxyMiddleware<T>): this;
  prepend(name: string, middleware: nx.ProxyMiddleware<T>): this;
  prepend(
    middlewareOrName: nx.ProxyMiddleware<T> | string,
    middleware?: nx.ProxyMiddleware<T>,
  ): this {
    this.entries.unshift(
      typeof middlewareOrName === "string"
        ? {
            name: middlewareOrName,
            middleware: middleware as nx.ProxyMiddleware<T>,
          }
        : { middleware: middlewareOrName },
    );
    return this;
  }

  insertAt(index: number, middleware: nx.ProxyMiddleware<T>): this {
    this.entries.splice(index, 0, { middleware });
    return this;
  }

  remove(middleware: nx.ProxyMiddleware<T>): this;
  remove(name: string): this;
  remove(middlewareOrName: nx.ProxyMiddleware<T> | string): this {
    this.entries = this.entries.filter(({ name, middleware }) =>
      typeof middlewareOrName === "string"
        ? name !== middlewareOrName
        : middleware !== middlewareOrName,
    );
    return this;
  }

  wrap(context: T): nx.ProxyTrapBuilder<T> {
    return <K extends keyof ProxyHandler<object>>(
      trap: K,
      handler: (ctx: T) => nx.ProxyTrap<K>,
    ) => {
      const realHandler = handler(context);

      return (...args: Parameters<ProxyHandler<object>[K]>) => {
        const middlewares = this.collect();
        let invoke = realHandler;

        for (let i = middlewares.length - 1; i >= 0; i--) {
          const middleware = middlewares[i];
          const downstream = invoke;

          invoke = (...innerArgs: Parameters<ProxyHandler<object>[K]>) => {
            let nextCalled = false;

            const next = () => {
              nextCalled = true;
            };

            middleware({ context, trap, args: innerArgs }, next);

            // call the next middleware if next() is invoked
            if (nextCalled) {
              return downstream(...innerArgs);
            }
          };
        }

        return invoke(...args);
      };
    };
  }

  private collect(): nx.ProxyMiddleware<T>[] {
    const inherited = this.parent?.collect() ?? [];
    return [...inherited, ...this.entries.map(({ middleware }) => middleware)];
  }
}
