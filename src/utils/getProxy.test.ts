import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import getProxy from "./getProxy.js";
import map from "./maps.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";

describe("getProxy", () => {
  it("creates a sandboxed proxy", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.nexo).toBe(nexo);
    expect(wrapper.traceable).toBe(false);
  });

  it("creates a proxy with a custom target", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = getProxy(nexo, target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.traceable).toBe(true);
    expect(Object.getPrototypeOf(proxy)).toBe(Object.getPrototypeOf(target));
  });

  it("creates proxy with a custom id", () => {
    const nexo = new Nexo();
    const listener = jest.fn();

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, undefined, "foo");
    const wrapper = Nexo.wrap(proxy);

    const [proxyEvent]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(wrapper.id).toBe("foo");
    expect(proxyEvent.data.id).toBe("foo");
  });

  it("emits a `proxy` event when a proxy is created", () => {
    const nexo = new Nexo();
    const target = {};
    const listener = jest.fn();

    nexo.on("proxy", listener);

    const proxy = nexo.create(target);
    const wrapper = Nexo.wrap(proxy);
    const [event]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(ProxyCreateEvent);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy");
    expect(event.data).toStrictEqual({
      id: wrapper.id,
      target,
      result: event.data.result,
    });
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

  it("prevents the `proxy` event and returns a different proxy", async () => {
    const nexo = new Nexo();
    const expectedProxy = getProxy(nexo);

    const listener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      return expectedProxy;
    });

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo);
    const [event] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(proxy).toBe(expectedProxy);
    expect(getResult()).toBe(expectedProxy);
  });

  it("accesses the final proxy from every listener of the `proxy` event", async () => {
    const nexo = new Nexo();

    const firstListener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      const name = "first-proxy";
      if (event.data.id === name) return;
      return getProxy(nexo, undefined, name);
    });

    const lastListener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      const name = "last-proxy";
      if (event.data.id === name) return;
      return getProxy(nexo, undefined, name);
    });

    nexo.on("proxy", firstListener);
    nexo.on("proxy", lastListener);

    const proxy = getProxy(nexo);

    const [firstListenerEvent] = firstListener.mock.lastCall;
    const [lastListenerEvent] = lastListener.mock.lastCall;

    const firstResult = await firstListenerEvent.data.result;
    const lastResult = await lastListenerEvent.data.result;

    expect(firstResult()).toBe(proxy);
    expect(lastResult()).toBe(proxy);
    expect(Nexo.wrap(proxy).id).toBe("last-proxy");
    expect(firstListener).toHaveBeenCalledTimes(3);
    expect(lastListener).toHaveBeenCalledTimes(3);
    expect(nexo.entries.size).toBe(3);
  });
});
