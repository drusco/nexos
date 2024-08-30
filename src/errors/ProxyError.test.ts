import ProxyError from "./ProxyError.js";
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

  it("Emits a proxy error event on the proxy and the nexo instance", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const nexoListener = jest.fn();
    const proxyListener = jest.fn();

    nexo.on("proxy.error", nexoListener);
    wrapper.on("proxy.error", proxyListener);

    new ProxyError("foo", proxy);

    const [proxyError] = nexoListener.mock.lastCall;
    const [proxyError2] = proxyListener.mock.lastCall;

    expect(nexoListener).toHaveBeenCalledTimes(1);
    expect(proxyListener).toHaveBeenCalledTimes(1);
    expect(proxyError).toBe(proxyError2);
    expect(proxyError).toBeInstanceOf(ProxyError);
    expect(proxyError.proxy).toBe(proxy);
  });
});
