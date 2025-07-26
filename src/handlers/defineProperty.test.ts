import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";

describe("DefineProperty handler", () => {
  describe("Event emission", () => {
    it("emits a defineProperty event with custom data", async () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const wrapper = Nexo.wrap(proxy);
      const listener = jest.fn();

      nexo.on("proxy.defineProperty", listener);
      wrapper.on("proxy.defineProperty", listener);

      const result = Reflect.defineProperty(proxy, "foo", { value: "bar" });

      const [event]: [nx.ProxyDefinePropertyEvent] = listener.mock.lastCall;
      const getResultFn = await event.data.result;

      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(event.target).toBe(proxy);
      expect(event.cancelable).toBe(true);
      expect(getResultFn()).toBe(result);
      expect(event.data).toStrictEqual({
        property: "foo",
        target: event.data.target,
        result: event.data.result,
        descriptor: { value: "bar" },
      });
    });
  });

  describe("Preventing and modifying behavior", () => {
    it("prevents defining the property entirely", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const wrapper = Nexo.wrap(proxy);

      wrapper.on(
        "proxy.defineProperty",
        (event: nx.ProxyDefinePropertyEvent) => {
          event.preventDefault();
        },
      );

      const result = Reflect.defineProperty(proxy, "foo", { value: 5 });

      expect(result).toBe(false);
      expect("foo" in proxy).toBe(false);
    });

    it("can replace the descriptor on sandboxed proxies", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const wrapper = Nexo.wrap(proxy);

      wrapper.on(
        "proxy.defineProperty",
        (event: nx.ProxyDefinePropertyEvent) => {
          event.preventDefault();
          return { value: 6 };
        },
      );

      const result = Reflect.defineProperty(proxy, "foo", { value: 5 });

      expect(result).toBe(true);
      expect(proxy.foo).toBe(6);
    });

    it("can replace the descriptor on regular proxies", async () => {
      const nexo = new Nexo();
      const proxy = nexo.create({ foo: 8 });
      const wrapper = Nexo.wrap(proxy);

      wrapper.on(
        "proxy.defineProperty",
        (event: nx.ProxyDefinePropertyEvent) => {
          event.preventDefault();
          return { value: 6 };
        },
      );

      const result = Reflect.defineProperty(proxy, "foo", { value: 5 });

      expect(result).toBe(true);
      expect(proxy.foo).toBe(6);
    });
  });

  describe("Inextensibility scenarios", () => {
    it("cannot define properties on frozen proxies", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      Object.freeze(proxy);

      expect(() => Reflect.defineProperty(proxy, "foo", { value: 10 })).toThrow(
        ProxyError,
      );

      expect(Object.isFrozen(proxy)).toBe(true);
    });

    it("cannot define properties on sealed proxies", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      Object.seal(proxy);

      expect(() => Reflect.defineProperty(proxy, "foo", { value: 20 })).toThrow(
        ProxyError,
      );

      expect(Object.isSealed(proxy)).toBe(true);
    });

    it("cannot define properties on unextensible proxies", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      Object.preventExtensions(proxy);

      expect(() => Reflect.defineProperty(proxy, "foo", { value: 30 })).toThrow(
        ProxyError,
      );

      expect(Object.isExtensible(proxy)).toBe(false);
    });
  });

  describe("Basic functionality", () => {
    it("defines a new property on the proxy", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      const result = Reflect.defineProperty(proxy, "foo", { value: true });

      expect(result).toBe(true);
      expect(proxy.foo).toBe(true);
    });

    it("allows redefining a configurable property", () => {
      const nexo = new Nexo();
      const proxy = nexo.create({ foo: 1 });

      Reflect.defineProperty(proxy, "foo", { value: 2 });

      expect(proxy.foo).toBe(2);
    });
  });

  describe("Error scenarios", () => {
    it("cannot redefine non-configurable and non-writable properties", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const wrapper = Nexo.wrap(proxy);
      const listener = jest.fn();

      nexo.on("error", listener);
      nexo.on("proxy.error", listener);
      wrapper.on("proxy.error", listener);

      Reflect.defineProperty(proxy, "foo", {
        value: true,
        configurable: false,
        writable: false,
      });

      expect(() =>
        Reflect.defineProperty(proxy, "foo", { value: false }),
      ).toThrow(ProxyError);

      const [proxyError] = listener.mock.lastCall;

      expect(proxy.foo).toBe(true);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(proxyError).toBeInstanceOf(ProxyError);
    });

    it("throws error when defining a non-configurable property that does not exist", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      expect(() =>
        Object.defineProperty(proxy, "foo", {
          configurable: false,
        }),
      ).toThrow(ProxyError);
    });

    it("throws error when redefining an existing property fails", () => {
      const nexo = new Nexo();
      const proxy = nexo.create({});

      Reflect.defineProperty(proxy, "foo", { value: true });

      expect(() =>
        Object.defineProperty(proxy, "foo", {
          value: false,
        }),
      ).toThrow(ProxyError);
    });

    it("cannot define a non-configurable property over a configurable one", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      proxy.length = 2;

      expect(() =>
        Object.defineProperty(proxy, "length", {
          configurable: false,
        }),
      ).toThrow(ProxyError);
    });
  });

  describe("Edge cases", () => {
    it("ignores returned descriptor if preventDefault is not called", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const wrapper = Nexo.wrap(proxy);

      wrapper.on("proxy.defineProperty", () => {
        return { value: 100 };
      });

      const result = Reflect.defineProperty(proxy, "foo", { value: 10 });

      expect(result).toBe(true);
      expect(proxy.foo).toBe(10); // descriptor was NOT replaced
    });

    it("throws when descriptor is invalid (e.g. getter and writable)", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();

      expect(() =>
        Reflect.defineProperty(proxy, "foo", {
          get: () => 42,
          writable: true,
        }),
      ).toThrow(TypeError); // Native JS error, not ProxyError
    });

    it("supports symbol keys", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      const sym = Symbol("mySymbol");

      const result = Reflect.defineProperty(proxy, sym, { value: 123 });

      expect(result).toBe(true);
      expect(proxy[sym]).toBe(123);
    });

    it("can define accessor properties", () => {
      const nexo = new Nexo();
      const proxy = nexo.create();
      let internal = 0;

      const result = Reflect.defineProperty(proxy, "value", {
        get: () => internal,
        set: (v) => (internal = v),
      });

      proxy.value = 42;

      expect(result).toBe(true);
      expect(proxy.value).toBe(42);
    });
  });
});
