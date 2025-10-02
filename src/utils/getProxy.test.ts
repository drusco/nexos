import isProxy from "./isProxy.js";
import getProxy from "./getProxy.js";
import getProxyWrapper from "./getProxyWrapper.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxy", () => {
  it("creates a valid proxy", () => {
    const proxy = getProxy();
    const nonProxy = {};

    expect(isProxy(proxy)).toBe(true);
    expect(isProxy(nonProxy)).toBe(false);
  });

  it("return and existing proxy", () => {
    const proxy = getProxy();
    const sameProxy = getProxy(proxy);

    expect(sameProxy).toBe(proxy);
  });

  it("creates a wrapper for the proxy", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("creates a revocable proxy", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);

    wrapper.revoke();

    expect(() => (proxy.foo = true)).toThrow(TypeError);
  });

  it("creates a sandboxed proxy", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper.traceable).toBe(false);
    expect(typeof wrapper.target).toBe("function");
  });

  it("resolves the prototype as null on sandboxed proxies", () => {
    const proxy = getProxy();
    const prototype = Object.getPrototypeOf(proxy);

    expect(prototype).toBeNull();
  });

  it("has no enumerable or inherited keys by default", () => {
    const proxy = getProxy();

    const keys = [];

    for (const key in proxy) {
      keys.push(key);
    }

    expect(keys.length).toBe(0);
  });

  it("creates a traceable proxy", () => {
    const target = [];
    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper.traceable).toBe(true);
    expect(wrapper.target).toBe(target);
  });

  it("uses the target prototype on traceable proxies", () => {
    const target = [];
    const proxy = getProxy(target);
    const proxyPrototype = Object.getPrototypeOf(proxy);
    const targetPrototype = Object.getPrototypeOf(target);

    expect(proxyPrototype).toBe(targetPrototype);
  });
});
