import EventEmitter from "./utils/EventEmitter.js";
import Nexo from "./Nexo.js";
import TraceableMap from "./utils/TraceableMap.js";
import Event from "./events/Event.js";
import ProxyPipeline from "./utils/ProxyPipeline.js";
import ProxyError from "./utils/ProxyError.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(TraceableMap);
    expect(nexo.events).toBeInstanceOf(EventEmitter);
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
    const proxyC = nexo.use("foo") as object as unknown[];

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
    const target = { foo: 0, bar: 0 };

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

  it("Only locks a proxy in its own instance", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = { foo: 0 };

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    const wrapperA = Nexo.wrap(proxyA);
    wrapperA.lock();

    expect(() => proxyA.foo).toThrow(); // should throw
    expect(() => proxyB.foo).not.toThrow(); // should not throw
  });

  it("exposes a shared middleware pipeline", () => {
    const nexo = new Nexo();

    expect(nexo.pipeline).toBeInstanceOf(ProxyPipeline);
  });

  it("applies manager middleware to created proxies", () => {
    const nexo = new Nexo();
    const traps: string[] = [];

    nexo.pipeline.use(({ trap }, next) => {
      traps.push(trap);
      return next();
    });

    const proxy = nexo.create({ value: 1 }) as { value: unknown };
    void proxy.value;

    expect(traps).toContain("get");
  });

  it("keeps the lock guard even when the manager pipeline is mutated", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ value: 1 }) as { value: unknown };
    const wrapper = Nexo.wrap(proxy);

    wrapper.lock();

    // Locking is enforced by the wrapper itself (not by a middleware), so
    // mutating the manager's pipeline cannot remove or precede it.
    nexo.pipeline.remove("lock");
    nexo.pipeline.prepend((_, next) => next());

    expect(() => proxy.value).toThrow(ProxyError);
  });
});
