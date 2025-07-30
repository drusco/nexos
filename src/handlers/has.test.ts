import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";

describe("Has Handler", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.has", listener);
    wrapper.on("proxy.has", listener);

    Reflect.has(proxy, "foo");

    const [event]: [nx.ProxyHasEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(proxy);
    expect(event.data.property).toBe("foo");
    expect(getResultFn()).toBe(false);
  });

  it("prevents the default has trap return value", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const listener = jest.fn((event: nx.ProxyHasEvent) => {
      event.preventDefault();
      return true;
    });

    wrapper.on("proxy.has", listener);

    const result = Reflect.has(proxy, "foo");

    const [event]: [nx.ProxyHasEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(result).toBe(true);
    expect(getResultFn()).toBe(true);
  });

  it("throws an error when the return value is not a boolean", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.has", (event: nx.ProxyHasEvent) => {
      event.preventDefault();
      return "invalid";
    });

    expect(() => Reflect.has(proxy, "foo")).toThrow(ProxyError);
  });

  it("returns a boolean indiating whether the property exists in the target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    expect(Reflect.has(proxy, "toString")).toBe(true);
    expect(Reflect.has(proxy, "foo")).toBe(false);
  });

  it("returns a boolean indiating whether the property exists in the sandbox", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const fakeArray = nexo.create();

    proxy.foo = true;
    Reflect.setPrototypeOf(fakeArray, Array.prototype);

    expect(Reflect.has(proxy, "toString")).toBe(false);
    expect(Reflect.has(proxy, "foo")).toBe(true);
    expect(Reflect.has(fakeArray, "indexOf")).toBe(true);
  });
});
