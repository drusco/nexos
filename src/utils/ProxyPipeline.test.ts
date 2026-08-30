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

  it("inserts middleware before a target by name", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    pipe.use("auth", (_, next) => {
      order.push("auth");
      next();
    });
    pipe.use("validation", (_, next) => {
      order.push("validation");
      next();
    });
    pipe.insertBefore("validation", (_, next) => {
      order.push("logging");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["auth", "logging", "validation"]);
  });

  it("inserts middleware after a target by reference", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    const auth = jest.fn((_, next) => {
      order.push("auth");
      next();
    });
    pipe.use(auth);
    pipe.use((_, next) => {
      order.push("validation");
      next();
    });
    pipe.insertAfter(auth, (_, next) => {
      order.push("rateLimit");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["auth", "rateLimit", "validation"]);
  });

  it("throws when inserting before an unknown middleware", () => {
    const pipe = new ProxyPipeline();

    expect(() => pipe.insertBefore("missing", () => {})).toThrow(
      "Cannot insert before an unknown middleware.",
    );
  });

  it("throws when inserting after an unknown middleware", () => {
    const pipe = new ProxyPipeline();

    expect(() => pipe.insertAfter("missing", () => {})).toThrow(
      "Cannot insert after an unknown middleware.",
    );
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

  it("registers a protected middleware that still runs in order", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    pipe.use(
      "guard",
      (_, next) => {
        order.push("guard");
        next();
      },
      { protected: true },
    );
    pipe.use((_, next) => {
      order.push("user");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["guard", "user"]);
  });

  it("throws when removing a protected middleware by reference", () => {
    const pipe = new ProxyPipeline();
    const middleware = jest.fn((_, next) => next());

    pipe.use(middleware, { protected: true });

    expect(() => pipe.remove(middleware)).toThrow(
      "Cannot remove a protected middleware.",
    );
  });

  it("throws when removing a protected middleware by name", () => {
    const pipe = new ProxyPipeline();

    pipe.use("guard", (_, next) => next(), { protected: true });

    expect(() => pipe.remove("guard")).toThrow(
      "Cannot remove a protected middleware.",
    );
  });

  it("throws when prepending to a pipeline with protected middlewares", () => {
    const pipe = new ProxyPipeline();

    pipe.use((_, next) => next(), { protected: true });

    expect(() => pipe.prepend((_, next) => next())).toThrow(
      "Cannot prepend before a protected middleware.",
    );
  });

  it("throws when inserting before a protected middleware", () => {
    const pipe = new ProxyPipeline();

    pipe.use("guard", (_, next) => next(), { protected: true });

    expect(() => pipe.insertBefore("guard", (_, next) => next())).toThrow(
      "Cannot insert before a protected middleware.",
    );
  });

  it("allows inserting after a protected middleware", () => {
    const pipe = new ProxyPipeline();
    const order: string[] = [];

    pipe.use(
      "guard",
      (_, next) => {
        order.push("guard");
        next();
      },
      { protected: true },
    );
    pipe.use((_, next) => {
      order.push("last");
      next();
    });
    pipe.insertAfter("guard", (_, next) => {
      order.push("middle");
      next();
    });

    const trap = pipe.wrap({})("get", () => () => "value");
    trap({}, "property", {});

    expect(order).toEqual(["guard", "middle", "last"]);
  });

  it("throws when re-parenting a pipeline with protected middlewares", () => {
    const pipe = new ProxyPipeline();

    pipe.use((_, next) => next(), { protected: true });

    expect(() => pipe.setParent(new ProxyPipeline())).toThrow(
      "Cannot re-parent a pipeline that contains protected middlewares.",
    );
  });
});
