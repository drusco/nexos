import ProxyError from "./ProxyError.js";
import Nexo from "../Nexo.js";

describe("ProxyError", () => {
  it("creates a ProxyError instance with the correct message and proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const error = new ProxyError("Something went wrong", proxy);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProxyError);
    expect(error.message).toBe("Something went wrong");
    expect(error.proxy).toBe(proxy);
    expect(error.name).toBe("ProxyError");
  });

  it("emits both generic and namespaced proxy error events", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const nexoErrorHandler = jest.fn();
    const proxyErrorHandler = jest.fn();

    nexo.on("error", nexoErrorHandler);
    nexo.on("proxy.error", nexoErrorHandler);

    wrapper.on("error", proxyErrorHandler);
    wrapper.on("proxy.error", proxyErrorHandler);

    const emittedError = new ProxyError("Emitted error", proxy);

    expect(nexoErrorHandler).toHaveBeenCalledTimes(2);
    expect(proxyErrorHandler).toHaveBeenCalledTimes(2);

    for (const handler of [nexoErrorHandler, proxyErrorHandler]) {
      const [err] = handler.mock.lastCall;
      expect(err).toBeInstanceOf(ProxyError);
      expect(err.message).toBe("Emitted error");
      expect(err.proxy).toBe(proxy);
    }

    expect(emittedError.name).toBe("ProxyError");
  });
});
