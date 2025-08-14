import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../utils/ProxyError.js";

describe("PreventExtensions Handler", () => {
  it("prevents extensions on the sandboxed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = Reflect.preventExtensions(proxy);

    expect(result).toBe(true);
    expect(Object.isExtensible(proxy)).toBe(false);
  });

  it("prevents extensions on the proxy target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const result = Reflect.preventExtensions(proxy);

    expect(result).toBe(true);
    expect(Object.isExtensible(proxy)).toBe(false);
    expect(Object.isExtensible(target)).toBe(false);
  });

  it("emits a 'proxy.preventExtensions' event", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.preventExtensions", listener);
    wrapper.on("proxy.preventExtensions", listener);

    const result = Reflect.preventExtensions(proxy);

    const [event]: [nx.ProxyPreventExtensionsEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.name).toBe("proxy.preventExtensions");
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(getResult()).toBe(true);
    expect(result).toBe(true);
  });

  it("prevents the default behavior on the operation", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const listener = jest.fn((event: nx.ProxyPreventExtensionsEvent) => {
      event.preventDefault();
      return false;
    });

    wrapper.on("proxy.preventExtensions", listener);

    const result = Reflect.preventExtensions(proxy);
    const [event]: [nx.ProxyPreventExtensionsEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(result).toBe(false);
    expect(getResult()).toBe(false);
    expect(event.returnValue).toBe(false);
    expect(Reflect.isExtensible(proxy)).toBe(true);
  });

  it("throws if the return value is not false or undefined", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const listener = jest.fn((event: nx.ProxyPreventExtensionsEvent) => {
      event.preventDefault();
      return true;
    });

    wrapper.on("proxy.preventExtensions", listener);

    expect(() => Reflect.preventExtensions(proxy)).toThrow(ProxyError);
    expect(Reflect.isExtensible(proxy)).toBe(true);
  });
});
