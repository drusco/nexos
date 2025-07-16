import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("getPrototypeOf", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.getPrototypeOf", listener);
    wrapper.on("proxy.getPrototypeOf", listener);

    const prototype = Reflect.getPrototypeOf(proxy);

    const [event]: [nx.ProxyGetPrototypeOfEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(prototype).toBeNull();
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.cancelable).toBe(false);
    expect(event.target).toBe(proxy);
    expect(event.data.result).toBe(prototype);
  });

  it("Returns the traceable target prototype", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.create(target);

    const prototype = Reflect.getPrototypeOf(target);

    expect(Reflect.getPrototypeOf(proxy)).toBe(prototype);
    expect(Object.getPrototypeOf(proxy)).toBe(prototype);
    expect(Nexo.getPrototypeOf(proxy)).toBe(prototype);
  });

  it("Returns null for proxies without a traceable target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(Nexo.getPrototypeOf(proxy)).toBeNull();
  });

  it("Returns a custom prototype", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Reflect.setPrototypeOf(proxy, Array.prototype);

    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(Nexo.getPrototypeOf(proxy)).toBe(Array.prototype);
  });

  it("Updates the targets current prototype", () => {
    const nexo = new Nexo();
    const target = new Map();
    const proxy = nexo.create(target);

    Reflect.setPrototypeOf(proxy, Array.prototype);

    expect(Reflect.getPrototypeOf(proxy)).toBe(Array.prototype);
    expect(Object.getPrototypeOf(proxy)).toBe(Array.prototype);
    expect(Nexo.getPrototypeOf(proxy)).toBe(Array.prototype);
  });
});
