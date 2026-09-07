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
    if (this.protectedCount() > 0) {
      throw new Error(
        "Cannot re-parent a pipeline that contains protected middlewares.",
      );
    }

    this.parent = parent;
    return this;
  }

  use(middleware: nx.ProxyMiddleware<T>): this;
  use(name: string, middleware: nx.ProxyMiddleware<T>): this;
  use(
    middleware: nx.ProxyMiddleware<T>,
    options: nx.ProxyMiddlewareOptions,
  ): this;
  use(
    name: string,
    middleware: nx.ProxyMiddleware<T>,
    options: nx.ProxyMiddlewareOptions,
  ): this;
  use(
    middlewareOrName: nx.ProxyMiddleware<T> | string,
    middlewareOrOptions?: nx.ProxyMiddleware<T> | nx.ProxyMiddlewareOptions,
    maybeOptions?: nx.ProxyMiddlewareOptions,
  ): this {
    const name =
      typeof middlewareOrName === "string" ? middlewareOrName : undefined;
    const middleware = (
      name ? middlewareOrOptions : middlewareOrName
    ) as nx.ProxyMiddleware<T>;
    const options = (name ? maybeOptions : middlewareOrOptions) as
      nx.ProxyMiddlewareOptions | undefined;

    this.entries.push({
      ...(name ? { name } : {}),
      ...(options?.protected ? { protected: true } : {}),
      ...(options?.traps ? { traps: options.traps } : {}),
      middleware,
    });
    return this;
  }

  prepend(middleware: nx.ProxyMiddleware<T>): this;
  prepend(name: string, middleware: nx.ProxyMiddleware<T>): this;
  prepend(
    middlewareOrName: nx.ProxyMiddleware<T> | string,
    middleware?: nx.ProxyMiddleware<T>,
  ): this {
    if (this.protectedCount() > 0) {
      throw new Error("Cannot prepend before a protected middleware.");
    }

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

  insertBefore(
    target: nx.ProxyMiddleware<T> | string,
    middleware: nx.ProxyMiddleware<T>,
  ): this {
    const index = this.findIndex(target);

    if (index === -1) {
      throw new Error("Cannot insert before an unknown middleware.");
    }

    if (this.entries[index].protected) {
      throw new Error("Cannot insert before a protected middleware.");
    }

    this.entries.splice(index, 0, { middleware });
    return this;
  }

  insertAfter(
    target: nx.ProxyMiddleware<T> | string,
    middleware: nx.ProxyMiddleware<T>,
  ): this {
    const index = this.findIndex(target);

    if (index === -1) {
      throw new Error("Cannot insert after an unknown middleware.");
    }

    this.entries.splice(index + 1, 0, { middleware });
    return this;
  }

  remove(middleware: nx.ProxyMiddleware<T>): this;
  remove(name: string): this;
  remove(middlewareOrName: nx.ProxyMiddleware<T> | string): this {
    const matches = ({
      name,
      middleware,
    }: nx.ProxyMiddlewareEntry<T>): boolean =>
      typeof middlewareOrName === "string"
        ? name === middlewareOrName
        : middleware === middlewareOrName;

    if (this.entries.some((entry) => matches(entry) && entry.protected)) {
      throw new Error("Cannot remove a protected middleware.");
    }

    this.entries = this.entries.filter((entry) => !matches(entry));
    return this;
  }

  wrap(context: T): nx.ProxyTrapBuilder<T> {
    return <K extends keyof ProxyHandler<object>>(
      trap: K,
      handler: (ctx: T) => nx.ProxyTrap<K>,
    ) => {
      const realHandler = handler(context);

      return (...args: Parameters<ProxyHandler<object>[K]>) => {
        const middlewares = this.collect(trap);

        const dispatch = (
          index: number,
          value?: ReturnType<ProxyHandler<object>[K]>,
        ): ReturnType<ProxyHandler<object>[K]> => {
          const middleware = middlewares[index];

          if (!middleware) {
            return value === undefined ? realHandler(...args) : value;
          }

          return middleware(
            { context, trap, args },
            (nextValue?: ReturnType<ProxyHandler<object>[K]>) =>
              dispatch(index + 1, nextValue),
          );
        };

        return dispatch(0);
      };
    };
  }

  private protectedCount(): number {
    return this.entries.filter(({ protected: isProtected }) => isProtected)
      .length;
  }

  private findIndex(target: nx.ProxyMiddleware<T> | string): number {
    return this.entries.findIndex(({ name, middleware }) =>
      typeof target === "string" ? name === target : middleware === target,
    );
  }

  private collect(trap: keyof ProxyHandler<object>): nx.ProxyMiddleware<T>[] {
    const inherited = this.parent?.collect(trap) ?? [];
    const own = this.entries
      .filter(({ traps }) => !traps || traps.includes(trap))
      .map(({ middleware }) => middleware);

    return [...inherited, ...own];
  }
}
