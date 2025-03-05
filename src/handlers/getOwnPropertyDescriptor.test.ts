import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";

describe("getOwnPropertyDescriptor", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    proxy.foo = true;

    nexo.on("proxy.getOwnPropertyDescriptor", listener);
    wrapper.on("proxy.getOwnPropertyDescriptor", listener);

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, "foo");

    const [event]: [
      ProxyEvent<{ property: nx.ObjectKey; descriptor: PropertyDescriptor }>,
    ] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.cancelable).toBe(false);
    expect(event.target).toBe(proxy);
    expect(event.data.property).toBe("foo");
    expect(event.data.descriptor).toStrictEqual<PropertyDescriptor>({
      configurable: true,
      enumerable: true,
      writable: true,
      value: true,
    });
    expect(descriptor).toBeUndefined();
  });

  it("Returns the traceable target descriptor", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.defineProperty(proxy, "foo", {
      value: true,
      configurable: false,
      enumerable: false,
      writable: true,
    });

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, "foo");

    expect(descriptor).toStrictEqual<PropertyDescriptor>({
      configurable: false,
      enumerable: false,
      writable: true,
      value: true,
    });
    expect(descriptor).toStrictEqual(
      Reflect.getOwnPropertyDescriptor(target, "foo"),
    );
  });

  it("Returns undefined descriptor for proxies created without a traceable target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.defineProperty(proxy, "foo", {
      value: true,
      configurable: true,
      enumerable: false,
      writable: true,
    });

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, "foo");

    expect(descriptor).toBeUndefined();
  });
});
