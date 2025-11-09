import isProxy from "./isProxy.js";
import getProxy from "./getProxy.js";
import getProxyWrapper from "./getProxyWrapper.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxy", () => {
  describe("Validate proxy types", () => {
    it("Validates types for sandboxed targets", () => {
      const proxy = getProxy();
      const proxyTypedAsArray = getProxy<unknown[]>();

      proxy.name = "test";
      proxy.apply = "test";
      proxy.bind = "test";
      proxy.call = "test";
      proxy.caller = "test";
      proxy.length = "test";
      proxy.toString = "test";
      proxy.arguments = "test";
      proxy.custom = "test";

      const instance = new proxy();
      const returnValue = proxy();

      const customInstance = new proxy<[], number[]>();
      const customReturn = proxy<[], string>();

      expect(proxy).toBe<nx.Proxy>(proxy);

      expect(proxy.name).toBe("test");
      expect(proxy.apply).toBe("test");
      expect(proxy.bind).toBe("test");
      expect(proxy.call).toBe("test");
      expect(proxy.caller).toBe("test");
      expect(proxy.length).toBe("test");
      expect(proxy.toString).toBe("test");
      expect(proxy.arguments).toBe("test");
      expect(proxy.custom).toBe("test");

      expect(instance).toBe<nx.Proxy>(instance);
      expect(returnValue).toBe<nx.Proxy>(returnValue);
      expect(customInstance).toBe<number[]>(customInstance);
      expect(customReturn).toBe<string>(customReturn);

      expect(typeof proxyTypedAsArray.length).toBe("function");
      expect(typeof proxyTypedAsArray.push).toBe("function");
    });

    it("Validates types for function targets", () => {
      function target(prop: string): string {
        return prop;
      }

      const proxy = getProxy(target);
      const returnValue = proxy("test");

      proxy.custom = "test";

      expect(proxy).toBe<typeof target>(proxy);
      expect(proxy.custom).toBe("test");
      expect(returnValue).toBe<string>(returnValue);
      expect(typeof returnValue).toBe("string");
    });

    it("Validates types for object targets", () => {
      const target = { test: true };
      const proxy = getProxy(target);

      proxy.test = false;

      expect(proxy).toBe<typeof target>(proxy);
      expect(proxy.test).toBe<boolean>(false);
    });

    it("Validates types for class targets", () => {
      class Target {
        static test() {}
        test() {}
        constructor(prop: string) {
          prop;
        }
      }

      const TargetClass = getProxy(Target);
      const instance = new TargetClass("test");

      expect(TargetClass).toBe<typeof TargetClass>(TargetClass);
      expect(TargetClass.test).toBe<typeof TargetClass.test>(TargetClass.test);
      expect(TargetClass.test()).toBeUndefined();
      expect(instance).toBe<Target>(instance);
      expect(instance.test()).toBeUndefined();
    });
  });

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
