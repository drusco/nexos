import Nexo from "../Nexo.js";

describe("createHandlers", () => {
  it("emits proxy.before, the trap event, then proxy.after in order", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ foo: "bar" });
    const order: string[] = [];

    nexo.events.on("proxy.before", (event) => order.push(event.name));
    nexo.events.on("proxy.get", (event) => order.push(event.name));
    nexo.events.on("proxy.after", (event) => order.push(event.name));

    const result = proxy.foo;

    expect(result).toBe("bar");
    expect(order).toEqual(["proxy.before", "proxy.get", "proxy.after"]);
  });

  it("exposes trap, args and the synchronous result on before/after", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ foo: "bar" });
    let before: nx.ProxyBeforeEvent | undefined;
    let after: nx.ProxyAfterEvent | undefined;

    nexo.events.on("proxy.before", (event) => {
      before = event;
    });
    nexo.events.on("proxy.after", (event) => {
      after = event;
    });

    const result = proxy.foo;

    expect(result).toBe("bar");
    expect(before?.cancelable).toBe(false);
    expect(before?.data.trap).toBe("get");
    expect(before?.data.args[1]).toBe("foo");

    expect(after?.cancelable).toBe(false);
    expect(after?.data.trap).toBe("get");
    expect(after?.data.args[1]).toBe("foo");
    expect(after?.data.result).toBe("bar");
  });
});
