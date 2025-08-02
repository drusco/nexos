import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("Set Hander", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.set", listener);
    wrapper.on("proxy.set", listener);

    proxy.foo = "bar";

    const [event]: [nx.ProxySetEvent] = listener.mock.lastCall;
    const getOperationResult: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy.set");
    expect(event.cancelable).toBe(true);
    expect(event.data.property).toBe("foo");
    expect(event.data.value).toBe("bar");
    expect(getOperationResult()).toBe(true);
  });

  it("can prevent the default event behavior on sandboxed proxies", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const replacement = "_sandboxed_";

    const listener = jest.fn((event: nx.ProxySetEvent) => {
      event.preventDefault();
      return replacement;
    });

    nexo.on("proxy.set", listener);

    proxy.foo = true;

    const [event]: [nx.ProxySetEvent] = listener.mock.lastCall;
    const getEventResult: nx.FunctionLike = await event.data.result;

    expect(proxy.foo).toBe(replacement);
    expect(event.returnValue).toBe(replacement);
    expect(getEventResult()).toBe(true);
  });

  it("can prevent the default event behavior on proxies with target", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ hasTarget: true });
    const replacement = "_has_target_";

    const listener = jest.fn((event: nx.ProxySetEvent) => {
      event.preventDefault();
      return replacement;
    });

    nexo.on("proxy.set", listener);

    proxy.foo = true;

    const [event]: [nx.ProxySetEvent] = listener.mock.lastCall;
    const getEventResult: nx.FunctionLike = await event.data.result;

    expect(proxy.foo).toBe(replacement);
    expect(event.returnValue).toBe(replacement);
    expect(getEventResult()).toBe(true);
  });

  it("throws an error when setting a custom value from a prevented event fails", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({});
    const replacement = false;

    nexo.on("proxy.set", (event: nx.ProxySetEvent) => {
      event.preventDefault();
      return replacement;
    });

    Reflect.defineProperty(proxy, "foo", { value: null });
    Reflect.defineProperty(proxyWithTarget, "foo", { value: null });

    expect(() => (proxy.foo = true)).toThrow(ProxyError);
    expect(() => (proxyWithTarget.foo = true)).toThrow(ProxyError);
  });

  it("throws an error when setting a custom value fails", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({});

    Reflect.defineProperty(proxy, "foo", { value: null });
    Reflect.defineProperty(proxyWithTarget, "foo", { value: null });

    expect(() => (proxy.foo = true)).toThrow(ProxyError);
    expect(() => (proxyWithTarget.foo = true)).toThrow(ProxyError);
  });

  it("can set symbol properties", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const sym = Symbol("test");

    proxy[sym] = 42;

    expect(proxy[sym]).toBe(42);
  });

  it("sets the value on the sandbox when present", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    proxy.foo = 123;

    expect(wrapper.sandbox["foo"]).toBe(123);
  });

  it("returns true when new property is added", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = (proxy.foo = "bar");

    expect(proxy.foo === "bar").toBe(true);
    expect(result).toBe("bar");
  });
});
