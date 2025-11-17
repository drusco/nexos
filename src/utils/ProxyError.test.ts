import ProxyError from "./ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("ProxyError", () => {
  it("creates a ProxyError instance with the correct message and proxy", () => {
    const { proxy } = new ProxyWrapper();
    const errorMessage = "Something went wrong";
    const proxyError = new ProxyError(errorMessage, proxy);

    expect(proxyError).toBeInstanceOf(Error);
    expect(proxyError.message).toBe(errorMessage);
    expect(proxyError.target).toBe(proxy);
    expect(proxyError.name).toBe("ProxyError");
  });
});
