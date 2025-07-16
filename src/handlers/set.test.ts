import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("set", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.set", listener);
    wrapper.on("proxy.set", listener);

    proxy.foo = true;

    const [event]: [nx.ProxySetEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.property).toBe("foo");
    expect(event.data.value).toBe(true);
  });

  it("Can prevent the default event behavior", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({});
    const replacement = false;

    nexo.on("proxy.set", (event: nx.ProxySetEvent) => {
      event.preventDefault();
      return replacement;
    });

    proxy.foo = true;
    proxyWithTarget.foo = true;

    expect(proxy.foo).toBe(replacement);
    expect(proxyWithTarget.foo).toBe(replacement);
  });

  it("Throws an error when setting a custom value from a prevented event fails", () => {
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

  it("Throws an error when setting a custom value fails", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({});

    Reflect.defineProperty(proxy, "foo", { value: null });
    Reflect.defineProperty(proxyWithTarget, "foo", { value: null });

    expect(() => (proxy.foo = true)).toThrow(ProxyError);
    expect(() => (proxyWithTarget.foo = true)).toThrow(ProxyError);
  });
});
