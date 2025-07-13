import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";

describe("preventExtensions", () => {
  it("Returns true when the preventExtension operation succeeds", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = Reflect.preventExtensions(proxy);

    expect(result).toBe(true);
  });

  it("Emits an preventExtensions event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.preventExtensions", listener);
    wrapper.on("proxy.preventExtensions", listener);

    const result = Reflect.preventExtensions(proxy);

    const [event]: [nx.ProxyPreventExtensionsEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data.result).toBe(true);
    expect(result).toBe(true);
  });
});
