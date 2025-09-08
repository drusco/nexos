import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import createProxy from "./createProxy.js";
import getProxyMap from "./getProxyMap.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("createProxy", () => {
  it("returns an existing proxy", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);
    const proxyWithTarget = createProxy(nexo, {});

    expect(createProxy(nexo, proxy)).toBe(proxy);
    expect(createProxy(nexo, proxyWithTarget)).toBe(proxyWithTarget);
  });

  it("returns an existing proxy by its id when the target is falsy", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo, null, "foo");
    const sameProxy = createProxy(nexo, undefined, "foo");

    expect(sameProxy).toBe(proxy);
    expect(nexo.entries.size).toBe(1);
    expect(nexo.entries.get("foo").deref()).toBe(proxy);
  });

  it("creates a sandboxed proxy", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.traceable).toBe(false);
    expect(nexo.entries.get(wrapper.id).deref()).toBe(proxy);
  });

  it("creates a proxy with a custom target", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo, []);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.traceable).toBe(true);
  });

  it("creates proxies with custom ids", () => {
    const nexo = new Nexo();
    const traceableProxy = createProxy(nexo, [], "foo");
    const sandboxedProxy = createProxy(nexo, null, "bar");

    expect(getProxyMap().get(traceableProxy).id).toBe("foo");
    expect(getProxyMap().get(sandboxedProxy).id).toBe("bar");
  });

  it("links a ProxyWrapper instance to the proxy", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);
    const wrapper = Nexo.wrap(proxy);

    expect(getProxyMap().has(proxy)).toBe(true);
    expect(getProxyMap().get(proxy)).toBeInstanceOf(ProxyWrapper);
    expect(getProxyMap().get(proxy)).toBe(wrapper);
  });

  it("links the proxy id to the proxy weak reference", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);
    const wrapper = Nexo.wrap(proxy);

    expect(nexo.entries.has(wrapper.id)).toBe(true);
    expect(nexo.entries.get(wrapper.id)).toBeInstanceOf(WeakRef);
    expect(nexo.entries.get(wrapper.id).deref()).toBe(proxy);
  });

  it("emits a 'proxy' event when the proxy is created", async () => {
    const nexo = new Nexo();
    const target = {};
    const listener = jest.fn();

    nexo.events.on("proxy", listener);

    const proxy = createProxy(nexo, target, "foo");
    const [event]: [nx.ProxyCreateEvent] = listener.mock.lastCall;
    const resolveProxy = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(ProxyCreateEvent);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy");
    expect(event.data.id).toBe("foo");
    expect(event.data.target).toBe(target);
    expect(event.data.result).toBeInstanceOf(Promise);
    expect(resolveProxy()).toBe(proxy);
  });

  it("resolves the prototype as null on sandboxed proxies", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);

    expect(Object.getPrototypeOf(proxy)).toBeNull();
  });

  it("uses the target prototype on traceable proxies", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = createProxy(nexo, target);
    const proxyPrototype = Object.getPrototypeOf(proxy);
    const targetPrototype = Object.getPrototypeOf(target);

    expect(proxyPrototype).toBe(targetPrototype);
  });

  it("has no enumerable or inherited keys by default", () => {
    const nexo = new Nexo();
    const proxy = createProxy(nexo);

    const keys = [];

    for (const key in proxy) {
      keys.push(key);
    }

    expect(keys.length).toBe(0);
  });

  it("prevents the 'proxy' event and returns a cached proxy", async () => {
    const nexo = new Nexo();
    const cachedProxy = createProxy(nexo);

    const listener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      return cachedProxy;
    });

    nexo.events.on("proxy", listener);

    const proxy = createProxy(nexo);
    const [event] = listener.mock.lastCall;
    const resolveProxy = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(proxy).toBe(cachedProxy);
    expect(resolveProxy()).toBe(cachedProxy);
    expect(getProxyMap().has(event.target)).toBe(false);
    expect(nexo.entries.has(event.data.id)).toBe(false);
    expect(() => (event.target.isRevoked = true)).toThrow();
  });

  it("accesses the proxy returned by the last listener for the 'proxy' event", async () => {
    const nexo = new Nexo();

    const firstListener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      return createProxy(nexo, [], event.data.id, true);
    });

    const lastListener = jest.fn((event: nx.ProxyCreateEvent) => {
      event.preventDefault();
      return createProxy(nexo, {}, "last-proxy", true);
    });

    nexo.events.on("proxy", firstListener);
    nexo.events.on("proxy", lastListener);

    const proxy = createProxy(nexo);

    const [firstListenerEvent] = firstListener.mock.lastCall;
    const [lastListenerEvent] = lastListener.mock.lastCall;

    const getFirstProxy = await firstListenerEvent.data.result;
    const getLastProxy = await lastListenerEvent.data.result;
    const wrapper = getProxyMap().get(proxy);

    expect(getFirstProxy()).toBe(proxy);
    expect(getLastProxy()).toBe(proxy);
    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(lastListener).toHaveBeenCalledTimes(1);
    expect(wrapper.id).toBe("last-proxy");
    expect(nexo.entries.size).toBe(1);
    expect(nexo.entries.get("last-proxy").deref()).toBe(proxy);
  });
});
