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

  it("Emits proxy error events", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorListener = jest.fn();

    nexo.on("error", errorListener);
    nexo.on("proxy.error", errorListener);

    wrapper.on("error", errorListener);
    wrapper.on("proxy.error", errorListener);

    new ProxyError("foo", proxy);

    const [proxyError] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(4);
    expect(proxyError).toBeInstanceOf(ProxyError);
    expect(proxyError.proxy).toBe(proxy);
  });
});
