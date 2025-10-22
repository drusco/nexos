import ProxyError from "./ProxyError.js";
import getProxy from "./getProxy.js";

describe("ProxyError", () => {
  it("creates a ProxyError instance with the correct message and proxy", () => {
    const proxy = getProxy();
    const errorMessage = "Something went wrong";
    const proxyError = new ProxyError(errorMessage, proxy);

    expect(proxyError).toBeInstanceOf(Error);
    expect(proxyError.message).toBe(errorMessage);
    expect(proxyError.target).toBe(proxy);
    expect(proxyError.name).toBe("ProxyError");
  });
});
