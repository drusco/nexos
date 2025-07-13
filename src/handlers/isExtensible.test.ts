import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";

describe("isExtensible", () => {
  it("Returns true when the target object is extensible", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = Reflect.isExtensible(proxy);

    expect(result).toBe(true);
  });

  it("Returns false when the target object is not extensible", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.preventExtensions(proxy);

    const result = Reflect.isExtensible(proxy);

    expect(result).toBe(false);
  });

  it("Emits an isExtensible event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.isExtensible", listener);
    wrapper.on("proxy.isExtensible", listener);

    const result = Reflect.isExtensible(proxy);

    const [event]: [nx.ProxyIsExtensibleEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data.result).toBe(result);
    expect(result).toBe(true);
  });
});
