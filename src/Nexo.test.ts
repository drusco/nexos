import NexoEmitter from "./events/NexoEmitter.js";
import Nexo from "./Nexo.js";
import NexoMap from "./utils/NexoMap.js";
import isProxy from "./utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";

describe("Nexo", () => {
  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
    expect(nexo).toBeInstanceOf(NexoEmitter);
  });

  it("Access the wrapper using the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Access the wrapper using the target", () => {
    const nexo = new Nexo();
    const target = {};
    nexo.create(target);
    const wrapper = Nexo.wrap(target) as ProxyWrapper;

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Cannot return a ProxyWrapper without a traceable value", () => {
    const nonTraceable = [];
    const wrapper = Nexo.wrap(nonTraceable);

    expect(wrapper).toBeUndefined();
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

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
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    expect(proxyEvent).toBeInstanceOf(NexoEvent);
    expect(proxyEvent.target).toBe(proxy);
    expect(proxyEvent.name).toBe("proxy");
    expect(proxyEvent.data).toStrictEqual({ id: wrapper.id, target });
  });

  it("Creates a proxy by name with optional target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.use("foo", target);
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    expect(wrapper.id).toBe("foo");
    expect(nexo.entries.has("foo")).toBe(true);
  });

  it("Updates a proxy by name and target", () => {
    const nexo = new Nexo();
    const targetA = {};
    const targetB = [];

    const proxyA = nexo.use("foo", targetA);
    const proxyB = nexo.use("foo", targetB);
    const proxyC = nexo.use("foo");

    const wrapperA = Nexo.wrap(proxyA) as ProxyWrapper;
    const wrapperB = Nexo.wrap(proxyB) as ProxyWrapper;
    const wrapperC = Nexo.wrap(proxyC) as ProxyWrapper;

    expect(wrapperA.id).toBe("foo");
    expect(wrapperB.id).toBe("foo");
    expect(wrapperC.id).toBe("foo");

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.size).toBe(1);
    expect(proxyB).not.toBe(proxyA);
    expect(proxyC).toBe(proxyB);
  });
});
