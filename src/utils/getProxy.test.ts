import type * as nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import Nexo from "../Nexo.js";
import getProxy from "./getProxy.js";
import map from "./maps.js";

describe("getProxy", () => {
  it("creates a new proxy with a custom target", () => {
    const nexo = new Nexo();
    const listener = jest.fn();
    const target = [];

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, target);

    const [proxyEvent]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(proxyEvent).toBeInstanceOf(NexoEvent);
    expect(proxyEvent.data.target).toBe(target);
    expect(proxyEvent.target).toBe(proxy);
  });

  it("creates a new proxy with a custom id", () => {
    const nexo = new Nexo();
    const listener = jest.fn();

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, undefined, "foo");
    const wrapper = Nexo.wrap(proxy);

    const [proxyEvent]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(wrapper.id).toBe("foo");
    expect(proxyEvent.data.id).toBe("foo");
  });

  it("links internal data using weak maps", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);

    expect(map.proxies.has(proxy)).toBe(true);
  });

  it("returns an existing proxy", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toBe(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toBe(proxyWithTarget);
  });

  it("resolves the prototype as null on sandboxed proxies", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);

    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(typeof proxy.prototype).toBe("function");
  });

  it("allows setting the prototype property on sandboxed proxies", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);

    proxy.prototype = 3000;

    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(proxy.prototype).toBe(3000);
  });

  it("has no enumerable or inherited keys by default", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);

    const keys = [];

    for (const key in proxy) {
      keys.push(key);
    }

    expect(Object.keys(proxy)).toStrictEqual([]);
    expect(keys.length).toBe(0);
  });
});
