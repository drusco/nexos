import EventEmitter from "events";
import Nexo from "./Nexo.js";
import NexoMap from "./NexoMap.js";
import isProxy from "../utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("Nexo", () => {
  it("Accesses the proxy wrapper class", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();

    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo).toBeInstanceOf(EventEmitter);
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();

    expect(isProxy(proxy)).toBe(true);
    expect(typeof proxy).toBe("function");
    expect(Nexo.wrap(proxy).target).toBeUndefined();
  });

  it("Creates a new proxy object with a target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.proxy(target);
    const proxyTarget = Nexo.wrap(proxy).target;

    expect(proxyTarget && proxyTarget.deref()).toBe(target);
  });

  it("Emits an event when a proxy is created", () => {
    const nexo = new Nexo();
    const target = {};
    const createCallback = jest.fn();

    nexo.on("nx.proxy.create", createCallback);

    const proxy = nexo.proxy(target);
    const wrapper = Nexo.wrap(proxy);
    const [createEvent] = createCallback.mock.lastCall;

    expect(createCallback).toHaveBeenCalledTimes(1);
    expect(createEvent).toBeInstanceOf(NexoEvent);
    expect(createEvent.name).toBe("nx.proxy.create");
    expect(createEvent.target).toBe(nexo);
    expect(createEvent.data).toEqual({
      id: wrapper.id,
      target: wrapper.target,
    });
  });

  it("Creates a proxy by name", () => {
    const nexo = new Nexo();
    const proxy = nexo.use("foo");
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("foo");
    expect(nexo.entries.has("foo")).toBe(true);
    expect(wrapper.target).toBeUndefined();
  });

  it("Creates a proxy by name and target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("bar", target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("bar");
    expect(nexo.entries.has("bar")).toBe(true);
    expect(wrapper.target && wrapper.target.deref()).toBe(target);
  });

  it("Updates a proxy by name and target", () => {
    const nexo = new Nexo();
    const targetA = {};
    const targetB = [];

    const proxyA = nexo.use("foo", targetA);
    const proxyB = nexo.use("foo", targetB);

    const wrapperA = Nexo.wrap(proxyA);
    const wrapperB = Nexo.wrap(proxyB);
    const { target } = Nexo.wrap(nexo.use("foo"));

    expect(wrapperA.id).toBe("foo");
    expect(wrapperB.id).toBe("foo");

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.size).toBe(1);
    expect(target && target.deref()).toBe(targetB);
  });
});
