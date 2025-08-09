import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../utils/ProxyError.js";

describe("GetOwnPropertyDescriptor Handler", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    proxy.foo = true;

    nexo.on("proxy.getOwnPropertyDescriptor", listener);
    wrapper.on("proxy.getOwnPropertyDescriptor", listener);

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, "foo");

    const [event]: [nx.ProxyGetOwnPropertyDescriptorEvent] =
      listener.mock.lastCall;

    const getResultFn: nx.FunctionLike<[], PropertyDescriptor> =
      await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(proxy);
    expect(event.data.property).toBe("foo");
    expect(getResultFn()).toStrictEqual<PropertyDescriptor>({
      configurable: true,
      enumerable: true,
      writable: true,
      value: true,
    });
    expect(getResultFn()).toStrictEqual(descriptor);
  });

  it("returns the traceable target descriptor", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const property = "foo";

    Object.defineProperty(proxy, property, {
      value: true,
      configurable: false,
      enumerable: false,
      writable: true,
    });

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, property);

    expect(descriptor).toStrictEqual<PropertyDescriptor>({
      configurable: false,
      enumerable: false,
      writable: true,
      value: true,
    });
    expect(descriptor).toEqual(
      Reflect.getOwnPropertyDescriptor(target, property),
    );
  });

  it("returns the sandbox descriptor", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const property = "foo";
    const descriptor: PropertyDescriptor = {
      value: true,
      configurable: true,
      enumerable: false,
      writable: true,
    };

    Object.defineProperty(proxy, property, descriptor);

    const result = Reflect.getOwnPropertyDescriptor(proxy, property);

    expect(result).toStrictEqual(descriptor);
  });

  it("returns undefined for missing properties", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = Reflect.getOwnPropertyDescriptor(proxy, "doesNotExist");

    expect(result).toBeUndefined();
  });

  it("respects preventDefault and uses the return value", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const fakeDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      value: "intercepted",
      writable: false,
    };

    nexo.on(
      "proxy.getOwnPropertyDescriptor",
      (event: nx.ProxyGetOwnPropertyDescriptorEvent) => {
        event.preventDefault();
        return fakeDescriptor;
      },
    );

    const descriptor = Reflect.getOwnPropertyDescriptor(proxy, "foo");

    expect(descriptor).toStrictEqual(fakeDescriptor);
  });

  it("throws ProxyError if the event return value is invalid", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const errorListener = jest.fn();

    nexo.on("error", errorListener);
    nexo.on(
      "proxy.getOwnPropertyDescriptor",
      (event: nx.ProxyGetOwnPropertyDescriptorEvent) => {
        event.preventDefault();
        return null; // Not a valid descriptor
      },
    );

    expect(() => {
      Reflect.getOwnPropertyDescriptor(proxy, "foo");
    }).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(1);
  });
});
