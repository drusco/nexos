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

  it("Access the proxy wrapper", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper).toBeInstanceOf(NexoEmitter);
    expect(wrapper.nexo).toBe(nexo);
    expect(wrapper.revoked).toBe(false);
  });

  it("Creates a new proxy object without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

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

  it("Updates a proxy by name and target", () => {
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
    expect(proxyC).toBe(proxyB);
  });
});
