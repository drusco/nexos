import NexoEmitter from "./events/NexoEmitter.js";
import Nexo from "./Nexo.js";
import NexoMap from "./utils/NexoMap.js";
import isProxy from "./utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import ProxyError from "./errors/ProxyError.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo).toBeInstanceOf(NexoEmitter);
  });

  it("Access the wrapper using the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Access the wrapper using the target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const wrapper = nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = nexo.wrap(proxy);

    expect(isProxy(proxy)).toBe(true);
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
    const wrapper = nexo.wrap(proxy);

    expect(proxyEvent).toBeInstanceOf(NexoEvent);
    expect(proxyEvent.target).toBe(proxy);
    expect(proxyEvent.name).toBe("proxy");
    expect(proxyEvent.data).toStrictEqual({ id: wrapper.id, target });
  });

  it("Creates a proxy by name with optional target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("foo", target);
    const wrapper = nexo.wrap(proxy);

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

    const wrapperA = nexo.wrap(proxyA);
    const wrapperB = nexo.wrap(proxyB);
    const wrapperC = nexo.wrap(proxyC);

    expect(wrapperA.id).toBe("foo");
    expect(wrapperB.id).toBe("foo");
    expect(wrapperC.id).toBe("foo");

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.size).toBe(1);
    expect(proxyB).not.toBe(proxyA);
    expect(proxyC).toBe(proxyB);
  });

  it("Should not update a proxy name", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("foo", target);

    expect(nexo.use.bind(nexo, "bar", target)).toThrow(ProxyError);
    expect(nexo.use("bar")).not.toBe(proxy);
  });

  it("Get the own property descriptor of a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({ foo: "test" });

    const descriptor = nexo.getOwnPropertyDescriptor(proxy, "foo");
    const targetDescriptor = nexo.getOwnPropertyDescriptor(
      proxyWithTarget,
      "foo",
    );

    expect(descriptor).toBeUndefined();
    expect(targetDescriptor).toStrictEqual<PropertyDescriptor>({
      configurable: true,
      enumerable: true,
      writable: true,
      value: "test",
    });
  });

  it("Get the own keys of a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create({ foo: true, bar: true, baz: true });

    const emptyKeys = nexo.ownKeys(proxy);
    const targetKeys = nexo.ownKeys(proxyWithTarget);

    expect(emptyKeys).toStrictEqual([]);
    expect(targetKeys).toStrictEqual(["foo", "bar", "baz"]);
  });

  it("Should add and get the own keys of a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.foo = true;
    const keys = nexo.ownKeys(proxy);

    expect(keys).toStrictEqual(["foo"]);
  });

  it("Gets the prototype of a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyArray = nexo.create([]);

    expect(nexo.getPrototypeOf(proxy)).toBeNull();
    expect(nexo.getPrototypeOf(proxyArray)).toBe(Array.prototype);
  });

  it("Encapsulates proxies to their original Nexo instaces", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = () => {};

    const proxyA = nexoA.create(target);
    const proxyB = nexoB.create(target);

    expect(proxyA).not.toBe(proxyB);
  });

  it("Reuses proxy for same target within the same Nexo instance", () => {
    const nexo = new Nexo();
    const target = () => {};

    const proxy1 = nexo.create(target);
    const proxy2 = nexo.create(target);

    expect(proxy1).toBe(proxy2);
  });

  it("Throws when resolving a proxy with a different Nexo instance", () => {
    const nexoA = new Nexo();
    const nexoB = new Nexo();
    const target = () => {};

    const proxy = nexoA.create(target);

    expect(() => Nexo.resolveProxy(proxy, nexoB.id)).toThrow(ProxyError);
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

    const wrapperA = nexoA.wrap(proxyA);
    wrapperA.revoke();

    expect(() => proxyA.foo).toThrow(); // should throw
    expect(() => proxyB.foo).not.toThrow(); // should not throw
  });
});
