import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("Get Handler", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();
    const property = "name";
    const value = "foo";

    nexo.on("proxy.get", listener);
    wrapper.on("proxy.get", listener);

    proxy[property] = value;

    const result = proxy[property];
    const [event]: [nx.ProxyGetEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.property).toBe(property);
    expect(event.data.result).toBeInstanceOf(Promise);
    expect(getResultFn()).toBe(result);
    expect(proxy[property]).toBe(value);
  });

  it("prevents the default behavior and returns a different value", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const property = "name";
    const value = "baz";
    const newValue = "foo";

    const listener = jest.fn((event: nx.ProxyGetEvent) => {
      event.preventDefault();
      return newValue;
    });

    wrapper.on("proxy.get", listener);

    proxy[property] = value;

    const result = proxy[property];
    const [event]: [nx.ProxyGetEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(result).not.toBe(value);
    expect(result).toBe(newValue);
    expect(getResultFn()).toBe(newValue);
  });

  it("returns a value from the proxy target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ foo: true });
    const result = proxy.foo;

    expect(result).toBe(true);
  });

  it("returns a new proxy when the property does not exists on the sandbox", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = proxy.foo;

    expect(result).not.toBeUndefined();
    expect(Nexo.isProxy(result)).toBe(true);
  });
});
