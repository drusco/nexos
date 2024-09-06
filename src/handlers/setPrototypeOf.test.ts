import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("setPrototypeOf", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.setPrototypeOf", listener);
    wrapper.on("proxy.setPrototypeOf", listener);

    Reflect.setPrototypeOf(proxy, Array.prototype);
    const [event]: [ProxyEvent<{ prototype: object }>] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(proxy);
    expect(event.data.prototype).toBe(Array.prototype);
  });

  it("Can prevent the default event behavior", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    nexo.on("proxy.setPrototypeOf", (event: ProxyEvent) => {
      event.preventDefault();
      return;
    });

    Reflect.setPrototypeOf(proxy, Array.prototype);

    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(Nexo.getPrototypeOf(proxy)).toBeNull();
  });

  it("Cannot replace the prototype with a non-object", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    nexo.on("proxy.setPrototypeOf", (event: ProxyEvent) => {
      event.preventDefault();
      return "non-object";
    });

    const setPrototypeOf = Reflect.setPrototypeOf.bind(
      null,
      proxy,
      Array.prototype,
    );

    expect(setPrototypeOf).toThrow(ProxyError);
    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(Nexo.getPrototypeOf(proxy)).toBeNull();
  });

  it("Can set a new prototype on a proxy without traceable target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    nexo.on("proxy.setPrototypeOf", (event: ProxyEvent) => {
      event.preventDefault();
      return Array.prototype;
    });

    Reflect.setPrototypeOf(proxy, null);

    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
    expect(Object.getPrototypeOf(proxy)).toBeNull();
    expect(Nexo.getPrototypeOf(proxy)).toBe(Array.prototype);
  });

  it("Can set a new prototype on a proxy with traceable target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    nexo.on("proxy.setPrototypeOf", (event: ProxyEvent) => {
      event.preventDefault();
      return Array.prototype;
    });

    Reflect.setPrototypeOf(proxy, null);

    expect(Reflect.getPrototypeOf(proxy)).toBe(Array.prototype);
    expect(Reflect.getPrototypeOf(target)).toBe(Array.prototype);
    expect(Object.getPrototypeOf(proxy)).toBe(Array.prototype);
    expect(Object.getPrototypeOf(target)).toBe(Array.prototype);
    expect(Nexo.getPrototypeOf(proxy)).toBe(Array.prototype);
  });

  it("Throws an error when the traceable target is not extensible", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Reflect.preventExtensions(proxy);

    const setNewPrototype = Reflect.setPrototypeOf.bind(
      null,
      proxy,
      Array.prototype,
    );

    const setSamePrototype = Reflect.setPrototypeOf.bind(
      null,
      proxy,
      Nexo.getPrototypeOf(proxy),
    );

    expect(setNewPrototype).toThrow(ProxyError);
    expect(setSamePrototype).not.toThrow();
  });
});
