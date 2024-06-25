import EventEmitter from "events";
import Nexo from "./Nexo.js";
import NexoMap from "./utils/NexoMap.js";
import isProxy from "./utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo.events).toBeInstanceOf(EventEmitter);
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    expect(isProxy(proxy)).toBe(true);
    expect(typeof proxy).toBe("function");
    expect(wrapper.target).toBeUndefined();
  });

  it("Creates a new proxy object with a target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.target).toBe(target);
  });

  it("Emits an event when a proxy is created", () => {
    const nexo = new Nexo();
    const target = {};
    const createCallback = jest.fn();

    nexo.events.on("nx.proxy.create", createCallback);

    const proxy = nexo.create(target);
    const wrapper = new ProxyWrapper(proxy);
    const [createEvent] = createCallback.mock.lastCall;

    expect(createCallback).toHaveBeenCalledTimes(1);
    expect(createEvent).toBeInstanceOf(NexoEvent);
    expect(createEvent.name).toBe("nx.proxy.create");
    expect(createEvent.target).toBe(nexo);
    expect(createEvent.data).toStrictEqual({
      id: wrapper.id,
      target: wrapper.target,
    });
  });

  it("Creates a proxy by name", () => {
    const nexo = new Nexo();
    const proxy = nexo.use("foo");
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.id).toBe("foo");
    expect(nexo.entries.has("foo")).toBe(true);
    expect(wrapper.target).toBeUndefined();
  });

  it("Creates a proxy by name and target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("bar", target);
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.id).toBe("bar");
    expect(nexo.entries.has("bar")).toBe(true);
    expect(wrapper.target).toBe(target);
  });

  it("Updates a proxy by name and target", () => {
    const nexo = new Nexo();
    const targetA = {};
    const targetB = [];

    const proxyA = nexo.use("foo", targetA);
    const proxyB = nexo.use("foo", targetB);
    const proxyC = nexo.use("foo");

    const wrapperA = new ProxyWrapper(proxyA);
    const wrapperB = new ProxyWrapper(proxyB);
    const wrapperC = new ProxyWrapper(proxyC);

    expect(wrapperA.id).toBe("foo");
    expect(wrapperB.id).toBe("foo");
    expect(wrapperC.id).toBe("foo");

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.size).toBe(1);

    expect(wrapperA.target).toBe(targetA);
    expect(wrapperB.target).toBe(targetB);
    expect(wrapperC.target).toBe(targetB);
  });
});
