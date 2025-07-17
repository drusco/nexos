import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("get", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.get", listener);
    wrapper.on("proxy.get", listener);

    proxy.name = "foo";

    const result = proxy.name;

    const [event]: [nx.ProxyGetEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data.property).toBe("name");
    expect(event.data.result).toBe(result);
    expect(proxy.name).toBe("foo");
  });

  it("Returns a value from the proxy target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ foo: true });
    const result = proxy.foo;

    expect(result).toBe(true);
  });

  it("Returns a new proxy when the property does not exists on the sandbox", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = proxy.foo;

    expect(result).not.toBeUndefined();
    expect(Nexo.isProxy(result)).toBe(true);
  });
});
