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

    const proxyId = Nexo.getId(proxy);

    expect(proxyId).toBe(id);
  });

  it("Gets the target from a proxy", () => {
    const nexo = new Nexo();

    const foo = nexo.proxy();
    const fooTarget = Nexo.getTarget(foo);

    const target = [];
    const bar = nexo.proxy(target);
    const barTarget = Nexo.getTarget(bar);

    expect(fooTarget).toBeUndefined();
    expect(barTarget).toBe(target);
  });

  it("Wraps the proxy within its wrapper function to extend its usability", () => {
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
    expect(Nexo.getTarget(proxy)).toBeUndefined();
  });

  it("Creates a new proxy object with a target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.proxy(target);

    expect(Nexo.getTarget(proxy)).toBe(target);
  });

  it("Emits an event when a proxy is created", () => {
    const nexo = new Nexo();
    const target = {};
    const createCallback = jest.fn();

    nexo.on("nx.proxy.create", createCallback);

    const proxy = nexo.proxy(target);
    const [createEvent] = createCallback.mock.lastCall;

    expect(createCallback).toHaveBeenCalledTimes(1);
    expect(createEvent).toBeInstanceOf(NexoEvent);
    expect(createEvent.name).toBe("nx.proxy.create");
    expect(createEvent.target).toBe(nexo);
    expect(createEvent.data).toEqual({
      id: Nexo.getId(proxy),
      target,
    });
  });
});
