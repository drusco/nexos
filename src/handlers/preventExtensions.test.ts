import ProxyEvent from "../events/ProxyEvent.js";
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
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    wrapper.on("proxy.preventExtensions", listener);

    const result = Reflect.preventExtensions(proxy);

    const [event]: [ProxyEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBeUndefined();
    expect(result).toBe(true);
  });
});
