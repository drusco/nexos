import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("defineProperty", () => {
  it("Emits a defineProperty event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const listener = jest.fn();

    nexo.on("proxy.defineProperty", listener);
    wrapper.on("proxy.defineProperty", listener);

    const result = Reflect.defineProperty(proxy, "foo", { value: "bar" });

    const [event]: [ProxyEvent<{ target: object }>] = listener.mock.lastCall;

    expect(result).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);

    expect(event.data).toStrictEqual({
      property: "foo",
      target: event.data.target,
      descriptor: {
        value: "bar",
      },
    });
  });

  it("Returns false when the event is prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.defineProperty", (event: ProxyEvent) => {
      event.preventDefault();
    });

    const result = Reflect.defineProperty(proxy, "foo", { value: 5 });

    expect(result).toBe(false);
    expect(proxy.foo).not.toBe(5);
  });

  it("Cannot define properties on frozen proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.freeze(proxy);

    expect(
      Reflect.defineProperty.bind(null, proxy, "foo", { value: 10 }),
    ).toThrow(ProxyError);

    expect(Object.isFrozen(proxy)).toBe(true);
  });

  it("Cannot define properties on sealed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.seal(proxy);

    expect(
      Reflect.defineProperty.bind(null, proxy, "foo", { value: 20 }),
    ).toThrow(ProxyError);

    expect(Object.isSealed(proxy)).toBe(true);
  });

  it("Cannot define properties on unextensible proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    Object.preventExtensions(proxy);

    expect(
      Reflect.defineProperty.bind(null, proxy, "foo", { value: 30 }),
    ).toThrow(ProxyError);

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
    const listener = jest.fn();

    nexo.on("proxy.error", listener);
    wrapper.on("proxy.error", listener);

    Reflect.defineProperty(proxy, "foo", { value: true });

    expect(
      Reflect.defineProperty.bind(null, proxy, "foo", { value: false }),
    ).toThrow(ProxyError);

    const [proxyError] = listener.mock.lastCall;

    expect(proxy.foo).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(proxyError).toBeInstanceOf(ProxyError);
  });

  it("Throws an error when non-configurable property definition fails because it does not exists", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const defineProperty = Object.defineProperty.bind(null, proxy, "foo", {
      configurable: false,
    });

    expect(defineProperty).toThrow(ProxyError);
  });

  it("Throws an error when property definition on the target fails", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({});

    Reflect.defineProperty(proxy, "foo", { value: true });

    const defineProperty = Object.defineProperty.bind(null, proxy, "foo", {
      value: false,
    });

    expect(defineProperty).toThrow(ProxyError);
  });

  it("Cannot define non-configurable property that is configurable on the sandbox", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.length = 2;

    const defineProperty = Object.defineProperty.bind(null, proxy, "length", {
      configurable: false,
    });

    expect(defineProperty).toThrow(ProxyError);
  });
});
