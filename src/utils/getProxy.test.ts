import type * as nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import Nexo from "../Nexo.js";
import getProxy from "./getProxy.js";
import map from "./maps.js";

describe("getProxy", () => {
  it("Creates a new proxy with a custom target", () => {
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

  it("Creates a new proxy with a custom id", () => {
    const nexo = new Nexo();
    const listener = jest.fn();

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, undefined, "foo");
    const wrapper = Nexo.wrap(proxy);

    const [proxyEvent]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(wrapper.id).toBe("foo");
    expect(proxyEvent.data.id).toBe("foo");
  });

  it("Links internal data using weak maps", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);

    expect(map.proxies.has(proxy)).toBe(true);
  });

  it("Returns an existing proxy", () => {
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
});
