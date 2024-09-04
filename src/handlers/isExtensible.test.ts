import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

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
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;
    const listener = jest.fn();

    wrapper.on("proxy.isExtensible", listener);

    const result = Reflect.isExtensible(proxy);

    const [event]: [ProxyEvent<boolean>] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(result);
    expect(result).toBe(true);
  });
});
