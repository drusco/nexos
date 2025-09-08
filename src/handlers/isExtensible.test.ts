import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../utils/ProxyError.js";

describe("IsExtensible Handler", () => {
  it("returns true when the sandbox object is extensible", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    expect(Reflect.isExtensible(proxy)).toBe(true);
  });

  it("returns true when the target object is extensible", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    expect(Reflect.isExtensible(proxy)).toBe(true);
  });

  it("returns false when the sandbox object is not extensible", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.preventExtensions(proxy);

    expect(Reflect.isExtensible(proxy)).toBe(false);
  });

  it("returns false when the target object is not extensible", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.preventExtensions(proxy);

    expect(Reflect.isExtensible(proxy)).toBe(false);
  });

  it("emits a 'proxy.isExtensible' event", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.events.on("proxy.isExtensible", listener);
    wrapper.events.on("proxy.isExtensible", listener);

    const result = Reflect.isExtensible(proxy);
    const [event]: [nx.ProxyIsExtensibleEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy.isExtensible");
    expect(event.cancelable).toBe(true);
    expect(getResultFn()).toBe(result);
    expect(result).toBe(true);
  });

  it("uses the return value from a prevented event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.events.on(
      "proxy.isExtensible",
      (event: nx.ProxyIsExtensibleEvent) => {
        event.preventDefault();
        Object.preventExtensions(event.target);
        return false;
      },
    );

    expect(Object.isExtensible(proxy)).toBe(false);
  });

  it("throws when the return value from a prevented event is not a boolean", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.events.on("error", errorListener);
    nexo.events.on("proxy.error", errorListener);

    wrapper.events.on(
      "proxy.isExtensible",
      (event: nx.ProxyIsExtensibleEvent) => {
        event.preventDefault();
        return "invalid" as unknown as boolean;
      },
    );

    expect(() => Reflect.isExtensible(proxy)).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(2);
  });

  it("throws when the target is extensible but the listener returns false", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target); // proxy with real target (no sandbox)
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.events.on("error", errorListener);
    nexo.events.on("proxy.error", errorListener);

    wrapper.events.on(
      "proxy.isExtensible",
      (event: nx.ProxyIsExtensibleEvent) => {
        event.preventDefault();
        return false;
      },
    );

    expect(() => Reflect.isExtensible(proxy)).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(2);
  });

  it("resolves from sandbox when the event is not prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.preventExtensions(proxy);

    expect(Object.isExtensible(proxy)).toBe(false);
  });

  it("resolves from target when the event is not prevented", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.preventExtensions(proxy);

    expect(Object.isExtensible(proxy)).toBe(false);
    expect(Object.isExtensible(target)).toBe(false);
  });
});
