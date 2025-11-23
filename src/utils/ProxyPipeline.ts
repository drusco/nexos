type ProxyTrap<K extends keyof ProxyHandler<object>> = (
  ...args: Parameters<ProxyHandler<object>[K]>
) => ReturnType<ProxyHandler<object>[K]>;

type ProxyMiddlewareCtx<T, K extends keyof ProxyHandler<object>> = {
  context: T;
  trap: K;
  args: Parameters<ProxyHandler<object>[K]>;
};

type ProxyMiddleware<T> = (
  context: {
    [K in keyof ProxyHandler<object>]: ProxyMiddlewareCtx<T, K>;
  }[keyof ProxyHandler<object>],
  next: () => void,
) => void;

type ProxyTrapBuilder<T> = <K extends keyof ProxyHandler<object>>(
  trap: K,
  handler: (ctx: T) => ProxyTrap<K>,
) => ProxyTrap<K>;

interface ProxyPipe<T extends object> {
  use(middleware: ProxyMiddleware<T>): void;
  wrap(ctx: T): ProxyTrapBuilder<T>;
}

export default class ProxyPipeline<T extends object> implements ProxyPipe<T> {
  private stack: ProxyMiddleware<T>[] = [];

  use(middleware: ProxyMiddleware<T>): void {
    this.stack.push(middleware);
  }

  wrap(context: T): ProxyTrapBuilder<T> {
    return <K extends keyof ProxyHandler<object>>(
      trap: K,
      handler: (ctx: T) => ProxyTrap<K>,
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

          (middleware as (c: ProxyMiddlewareCtx<T, K>, n: () => void) => void)(
            {
              context,
              trap,
              args,
            },
            next,
          );

          // call next middleware if next() is invoked
          if (nextCalled) {
            return prev(...args);
          }
        };
      }

      return current;
    };
  }
}
