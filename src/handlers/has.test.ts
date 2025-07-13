import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";

describe("has", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.has", listener);
    wrapper.on("proxy.has", listener);

    Reflect.has(proxy, "foo");

    const [event]: [nx.ProxyHasEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.cancelable).toBe(false);
    expect(event.target).toBe(proxy);
    expect(event.data.property).toBe("foo");
    expect(event.data.result).toBe(false);
  });

  it("Returns a boolean indiating whether the property exists in the target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    expect(Reflect.has(proxy, "toString")).toBe(true);
    expect(Reflect.has(proxy, "foo")).toBe(false);
  });

  it("Returns a boolean indiating whether the property exists in the sandbox", () => {
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
