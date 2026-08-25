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

  it("runs prepended middlewares before appended ones", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    pipe.use((_, next) => {
      order.push("second");
      next();
    });
    pipe.prepend((_, next) => {
      order.push("first");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["first", "second"]);
  });

  it("inserts middleware at a specific index", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    pipe.use((_, next) => {
      order.push("first");
      next();
    });
    pipe.use((_, next) => {
      order.push("last");
      next();
    });
    pipe.insertAt(1, (_, next) => {
      order.push("middle");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["first", "middle", "last"]);
  });

  it("removes middleware by name", () => {
    const pipe = new ProxyPipeline();
    const calls: string[] = [];

    pipe.use("log", () => {
      calls.push("log");
    });
    pipe.remove("log");

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(calls).toEqual([]);
  });

  it("removes middleware by reference", () => {
    const pipe = new ProxyPipeline();
    const middleware = jest.fn((_, next) => next());

    pipe.use(middleware);
    pipe.remove(middleware);

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(middleware).not.toHaveBeenCalled();
  });

  it("runs parent middlewares before its own", () => {
    const parent = new ProxyPipeline();
    const child = new ProxyPipeline(parent);
    const order: string[] = [];

    parent.use((_, next) => {
      order.push("parent");
      next();
    });
    child.use((_, next) => {
      order.push("child");
      next();
    });

    const trap = child.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["parent", "child"]);
  });
});
