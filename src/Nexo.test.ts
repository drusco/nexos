import NexoEmitter from "./utils/NexoEmitter.js";
import Nexo from "./Nexo.js";
import NexoMap from "./utils/NexoMap.js";
import Event from "./events/Event.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo.events).toBeInstanceOf(NexoEmitter);
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
    const listener = jest.fn();

    nexo.events.on("proxy", listener);

    const proxy = nexo.create(target);
    const wrapper = Nexo.wrap(proxy);
    const [proxyEvent]: [nx.ProxyCreateEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(proxyEvent).toBeInstanceOf(Event);
    expect(proxyEvent.target).toBe(proxy);
    expect(proxyEvent.name).toBe("proxy");
    expect(proxyEvent.data).toStrictEqual({
      id: wrapper.id,
      target,
      result: proxyEvent.data.result,
    });
  });

  it("Creates a proxy by id with optional target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("foo", target);
    const sameProxy = nexo.use("foo");
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("foo");
    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.get("foo").deref()).toBe(proxy);
    expect(sameProxy).toBe(proxy);
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

  it("Does not emit events across different Nexo instances", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = {};

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    const listenerA = jest.fn();
    const listenerB = jest.fn();

    nexoA.events.on("proxy.set", listenerA);
    nexoB.events.on("proxy.set", listenerB);

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
});
