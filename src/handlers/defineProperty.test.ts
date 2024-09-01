import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("defineProperty", () => {
  it("Emits a defineProperty event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const definePropertyListener = jest.fn();

    nexo.on("proxy.defineProperty", definePropertyListener);
    wrapper.on("proxy.defineProperty", definePropertyListener);

    const result = Reflect.defineProperty(proxy, "foo", { value: "bar" });

    const [definePropertyEvent]: [ProxyEvent<{ target: object }>] =
      definePropertyListener.mock.lastCall;

    expect(result).toBe(true);
    expect(definePropertyListener).toHaveBeenCalledTimes(2);
    expect(definePropertyEvent.target).toBe(proxy);
    expect(definePropertyEvent.cancelable).toBe(true);

    expect(definePropertyEvent.data).toStrictEqual({
      property: "foo",
      target: definePropertyEvent.data.target,
      descriptor: {
        value: "bar",
      },
    });
  });

  it("Returns false when the event is default prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on(
      "proxy.defineProperty",
      (
        event: ProxyEvent<{ property: string; descriptor: PropertyDescriptor }>,
      ) => {
        event.preventDefault();
      },
    );

    const result = Reflect.defineProperty(proxy, "foo", { value: 5 });

    expect(result).toBe(false);
    expect(proxy.foo).not.toBe(5);
  });

  it("Cannot define properties on frozen proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.freeze(proxy);

    const result = Reflect.defineProperty(proxy, "foo", { value: 10 });

    expect(result).toBe(false);
    expect(Object.isFrozen(proxy)).toBe(true);
  });

  it("Cannot define properties on sealed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.seal(proxy);

    const result = Reflect.defineProperty(proxy, "foo", { value: 20 });

    expect(result).toBe(false);
    expect(Object.isSealed(proxy)).toBe(true);
  });

  it("Cannot define properties on non-extensible proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    Object.preventExtensions(proxy);

    const result = Reflect.defineProperty(proxy, "foo", { value: 30 });

    expect(result).toBe(false);
    expect(Object.isExtensible(proxy)).toBe(false);
  });

  it("Defines a new property on the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = Reflect.defineProperty(proxy, "foo", { value: true });

    expect(result).toBe(true);
    expect(proxy.foo).toBe(true);
  });

  it("Cannot redefine property: non writable, non configurable", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.on("proxy.error", errorListener);
    wrapper.on("proxy.error", errorListener);

    Reflect.defineProperty(proxy, "foo", { value: true });

    expect(
      Reflect.defineProperty.bind(null, proxy, "foo", { value: false }),
    ).toThrow(ProxyError);

    const [proxyError] = errorListener.mock.lastCall;

    expect(proxy.foo).toBe(true);
    expect(errorListener).toHaveBeenCalledTimes(2);
    expect(proxyError).toBeInstanceOf(ProxyError);
  });
});
