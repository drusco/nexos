import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("GetPrototypeOf Handler", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.getPrototypeOf", listener);
    wrapper.on("proxy.getPrototypeOf", listener);

    const prototype = Reflect.getPrototypeOf(proxy);

    const [event]: [nx.ProxyGetPrototypeOfEvent] = listener.mock.lastCall;
    const getResultFn = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(prototype).toBeNull();
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy.getPrototypeOf");
    expect(getResultFn()).toBe(prototype);
  });

  it("prevents the default behavior and returns a custom prototype", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn((event: nx.ProxyGetPrototypeOfEvent) => {
      event.preventDefault();
      return Array.prototype;
    });

    wrapper.on("proxy.getPrototypeOf", listener);

    expect(Object.getPrototypeOf(proxy)).toBe(Array.prototype);

    const [event]: [nx.ProxyGetPrototypeOfEvent] = listener.mock.lastCall;
    const getResultFn = await event.data.result;

    expect(getResultFn()).toBe(Array.prototype);
  });

  it("throws when the returned prototype is not an object or null", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    const listener = jest.fn((event: nx.ProxyGetPrototypeOfEvent) => {
      event.preventDefault();
      return "invalid" as unknown as object;
    });

    nexo.on("error", errorListener);
    wrapper.on("proxy.getPrototypeOf", listener);

    expect(() => Object.getPrototypeOf(proxy)).toThrow(ProxyError);

    const [event]: [nx.ProxyGetPrototypeOfEvent] = listener.mock.lastCall;

    expect(event.returnValue).toBe("invalid");
    expect(errorListener).toHaveBeenCalledTimes(1);
  });

  it("returns the traceable target prototype", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.create(target);

    const prototype = Reflect.getPrototypeOf(target);

    expect(Object.getPrototypeOf(proxy)).toBe(prototype);
  });

  it("falls back to null for sandboxed proxies by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(() => Object.getPrototypeOf(proxy)).not.toThrow();
  });

  it("returns the updated sandbox prototype", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Reflect.setPrototypeOf(proxy, Array.prototype);

    expect(Object.getPrototypeOf(proxy)).toBe(Array.prototype);
  });

  it("returns the updated target prototype", () => {
    const nexo = new Nexo();
    const target = new Map();
    const proxy = nexo.create(target);

    Reflect.setPrototypeOf(proxy, Array.prototype);

    expect(Object.getPrototypeOf(proxy)).toBe(Array.prototype);
  });
});
