import ProxyError from "./ProxyError.js";
import NexoEvent from "../events/NexoEvent.js";
import Nexo from "../Nexo.js";

describe("ProxyError", () => {
  it("Creates a new proxy error", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proxyError = new ProxyError("foo", proxy);

    expect(proxyError.message).toBe("foo");
    expect(proxyError).toBeInstanceOf(Error);
    expect(proxyError.proxy).toBe(proxy);
  });

  it("Emits a proxy error event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const nexoListener = jest.fn();
    const proxyListener = jest.fn();

    nexo.on("proxy.error", nexoListener);
    wrapper.on("proxy.error", proxyListener);

    const error = new ProxyError("foo", proxy);

    const [errorEvent] = nexoListener.mock.lastCall;
    const [errorEvent2] = proxyListener.mock.lastCall;

    expect(errorEvent).toBe(errorEvent2);
    expect(nexoListener).toHaveBeenCalledTimes(1);
    expect(proxyListener).toHaveBeenCalledTimes(1);
    expect(errorEvent).toBeInstanceOf(NexoEvent);
    expect(errorEvent.data).toBe(error);
    expect(errorEvent.target).toBe(proxy);
    expect(errorEvent.name).toBe("proxy.error");
  });
});
