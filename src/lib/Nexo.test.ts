import EventEmitter from "events";
import Nexo from "./Nexo.js";
import NexoMap from "./NexoMap.js";
import isProxy from "../utils/isProxy.js";
import NexoEvent from "./events/NexoEvent.js";

describe("Nexo", () => {
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
    expect(Nexo.getProxyTarget(proxy)).toBeUndefined();
  });

  it("Creates a new proxy object with a target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.proxy(target);

    expect(Nexo.getProxyTarget(proxy)).toBe(target);
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
      id: Nexo.getProxyId(proxy),
      target,
    });
  });
});
