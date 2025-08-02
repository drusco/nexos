import NexoEmitter from "./events/NexoEmitter.js";
import Nexo from "./Nexo.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import ProxyError from "./errors/ProxyError.js";
import maps from "./utils/maps.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo).toBeInstanceOf(NexoEmitter);
  });

  it("Access the wrapper using the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Access the wrapper using the target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    expect(Nexo.isProxy(proxy)).toBe(true);
    expect(typeof proxy).toBe("function");
    expect(nexo.entries.has(wrapper.id)).toBe(true);
  });

  it("Emits an event when a proxy is created", () => {
    const nexo = new Nexo();
    const target = {};
    let proxyEvent;

    nexo.on("proxy", (event: NexoEvent) => {
      proxyEvent = event;
    });

    const proxy = nexo.create(target);
    const wrapper = Nexo.wrap(proxy);

    expect(proxyEvent).toBeInstanceOf(NexoEvent);
    expect(proxyEvent.target).toBe(proxy);
    expect(proxyEvent.name).toBe("proxy");
    expect(proxyEvent.data).toStrictEqual({ id: wrapper.id, target });
  });

  it("Creates a proxy by name with optional target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("foo", target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("foo");
    expect(nexo.entries.has("foo")).toBe(true);
  });

  it("Updates the proxy target", () => {
    const nexo = new Nexo();
    const targetA = {};
    const targetB = [];

    const proxyA = nexo.use("foo", targetA);
    const proxyB = nexo.use("foo", targetB);
    const proxyC = nexo.use("foo");

    const wrapperA = Nexo.wrap(proxyA);
    const wrapperB = Nexo.wrap(proxyB);
    const wrapperC = Nexo.wrap(proxyC);

    expect(wrapperA.id).toBe("foo");
    expect(wrapperB.id).toBe("foo");
    expect(wrapperC.id).toBe("foo");

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.size).toBe(1);
    expect(proxyB).not.toBe(proxyA);
    expect((() => proxyC === proxyB)()).toBe(true);
  });

  it("Allows creating proxies for the same target under different ids", () => {
    const nexo = new Nexo();
    const target = {};
    const foo = nexo.use("foo", target);
    const bar = nexo.use("bar", target);

    expect(foo).not.toBe(bar);
  });

  it("Encapsulates proxies to their original Nexo instaces", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = () => {};

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    expect(proxyA).not.toBe(proxyB);
  });

  it("Creates unique proxies using the same target object", () => {
    const nexo = new Nexo();
    const target = () => {};

    const proxy1 = nexo.create(target);
    const proxy2 = nexo.create(target);

    expect(proxy1).not.toBe(proxy2);
  });

  it("Throws when the wrapper cannot be found", () => {
    const nexo = new Nexo();
    const target = () => {};

    const proxy = nexo.create(target);

    // force proxy removal from map of proxies
    maps.proxies.delete(proxy);

    expect(() => Nexo.wrap(proxy)).toThrow(ProxyError);
  });

  it("Does not emit events across different Nexo instances", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = {};

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    const listenerA = jest.fn();
    const listenerB = jest.fn();

    nexoA.on("proxy.set", listenerA);
    nexoB.on("proxy.set", listenerB);

    proxyA.foo = 123;
    proxyB.bar = 456;

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it("Only revokes proxy in its own instance", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = {};

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    const wrapperA = Nexo.wrap(proxyA);
    wrapperA.revoke();

    expect(() => proxyA.foo).toThrow(); // should throw
    expect(() => proxyB.foo).not.toThrow(); // should not throw
  });

  it("Returns true when the parameter is a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = Nexo.isProxy(proxy);

    expect(result).toBe(true);
  });

  it("Returns false when the parameter is not a proxy", () => {
    expect(Nexo.isProxy(undefined)).toBe(false);
    expect(Nexo.isProxy(NaN)).toBe(false);
    expect(Nexo.isProxy(null)).toBe(false);
    expect(Nexo.isProxy("foo")).toBe(false);
    expect(Nexo.isProxy(() => {})).toBe(false);
    expect(Nexo.isProxy({})).toBe(false);
    expect(Nexo.isProxy([])).toBe(false);
    expect(Nexo.isProxy(true)).toBe(false);
  });

  it("Returns true when the value is a non null object or a function", () => {
    const traceableObject = Nexo.isTraceable({});
    const traceableArray = Nexo.isTraceable([]);
    const traceableFunction = Nexo.isTraceable(() => {});

    expect(traceableArray).toBe(true);
    expect(traceableObject).toBe(true);
    expect(traceableFunction).toBe(true);
  });

  it("Returns false when the parameter is not traceable", () => {
    expect(Nexo.isTraceable(undefined)).toBe(false);
    expect(Nexo.isTraceable(NaN)).toBe(false);
    expect(Nexo.isTraceable(null)).toBe(false);
    expect(Nexo.isTraceable("foo")).toBe(false);
    expect(Nexo.isTraceable(1000)).toBe(false);
    expect(Nexo.isTraceable(true)).toBe(false);
  });
});
