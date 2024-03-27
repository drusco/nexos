import EventEmitter from "events";
import Nexo from "./Nexo.js";
import NexoMap from "./NexoMap.js";
import isProxy from "../utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("Nexo", () => {
  it("Gets the id from a proxy", () => {
    const nexo = new Nexo();
    const id = "baz";
    const proxy = nexo.use(id);

    const proxyId = Nexo.wrap(proxy).id;

    expect(proxyId).toBe(id);
  });

  it("Gets the target from a proxy", () => {
    const nexo = new Nexo();

    const foo = nexo.proxy();
    const fooTarget = Nexo.wrap(foo).target;

    const target = [];
    const bar = nexo.proxy(target);
    const barTarget = Nexo.wrap(bar).target;

    expect(fooTarget && fooTarget.deref()).toBeUndefined();
    expect(barTarget && barTarget.deref()).toBe(target);
  });

  it("Accesses the proxy wrapper class", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();

    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Creates a new nexo object", () => {
    const nexo = new Nexo();

    expect(nexo.entries).toBeInstanceOf(NexoMap);
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
});
