import ProxyPipeline from "./ProxyPipeline.js";

describe("ProxyPipeline", () => {
  it("allows adding middlewares that run before the trap", () => {
    const pipe = new ProxyPipeline();
    const context = { foo: true };
    const middleware = jest.fn((_, next) => next());
    const proxyTarget = (name: string) => name;

    pipe.use(middleware);

    const trapFactory = pipe.wrap(context);

    const applyTrap = trapFactory("apply", (ctx) => {
      // access the custom context
      expect(ctx).toBe(context);
      // return the real trap function
      return (target: nx.FunctionLike, _this, args) => {
        Reflect.apply(target, _this, args);
      };
    });

    const proxy = new Proxy<typeof proxyTarget>(proxyTarget, {
      apply: applyTrap,
    });

    // use the proxy
    proxy("test");

    const [, next]: [object, nx.FunctionLike] = middleware.mock.lastCall;

    expect(middleware).toHaveBeenCalledTimes(1);
    expect(middleware).toHaveBeenCalledWith(
      {
        context,
        trap: "apply",
        args: [proxyTarget, undefined, ["test"]],
      },
      next,
    );
  });
});
