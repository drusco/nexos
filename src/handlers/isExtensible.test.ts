import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";

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

    nexo.on("proxy.isExtensible", listener);
    wrapper.on("proxy.isExtensible", listener);

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

  it("uses the return value from a prevented event on sandboxed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.isExtensible", (event: nx.ProxyIsExtensibleEvent) => {
      event.preventDefault();
      return false;
    });

    expect(Reflect.isExtensible(proxy)).toBe(false);
  });

  it("throws when the return value from a prevented event is not a boolean", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.on("error", errorListener);
    nexo.on("proxy.error", errorListener);

    wrapper.on("proxy.isExtensible", (event: nx.ProxyIsExtensibleEvent) => {
      event.preventDefault();
      return "invalid";
    });

    expect(() => Reflect.isExtensible(proxy)).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(2);
  });

  it("throws when the target is extensible but the listener returns false", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target); // proxy with real target (no sandbox)
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.on("error", errorListener);
    nexo.on("proxy.error", errorListener);

    wrapper.on("proxy.isExtensible", (event: nx.ProxyIsExtensibleEvent) => {
      event.preventDefault();
      return false; // only works on sandboxed proxies
    });

    expect(() => Reflect.isExtensible(proxy)).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(2);
  });

  it("resolves from sandbox if available and event not prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.preventExtensions(proxy);

    expect(Reflect.isExtensible(proxy)).toBe(false);
  });

  it("resolves from target if no sandbox and event not prevented", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.preventExtensions(proxy);

    expect(Reflect.isExtensible(proxy)).toBe(false);
    expect(Reflect.isExtensible(target)).toBe(false);
  });
});
