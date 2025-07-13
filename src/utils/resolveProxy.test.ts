import ProxyError from "../errors/ProxyError.js";
import Nexo from "../Nexo.js";
import maps from "./maps.js";
import ProxyWrapper from "./ProxyWrapper.js";
import resolveProxy from "./resolveProxy.js";

describe("resolveProxy", () => {
  it("Gets a tuple of the proxy and its wrapper", () => {
    const nexo = new Nexo();
    const proxyObject = nexo.create();

    const [proxy, wrapper] = resolveProxy(proxyObject, nexo.id);

    expect(proxy).toBe(proxyObject);
    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Throws a ProxyError when the proxy is not found", () => {
    const nexo = new Nexo();

    expect(() => {
      resolveProxy({}, nexo.id);
    }).toThrow(ProxyError);
  });

  it("Throws a ProxyError when the ProxyWrapper is not found", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    maps.proxies.get(proxy).delete(nexo.id);

    expect(() => {
      resolveProxy(proxy, nexo.id);
    }).toThrow(ProxyError);
  });

  it("Returns consistent proxy and wrapper for repeated resolution", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result1 = resolveProxy(proxy, nexo.id);
    const result2 = resolveProxy(proxy, nexo.id);

    expect(result1[0]).toBe(result2[0]);
    expect(result1[1]).toBe(result2[1]);
  });

  it("Throws if the wrapper map is removed but the proxy is still present", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    // Simulate corruption: remove wrapper
    maps.proxies.delete(proxy);

    expect(() => {
      resolveProxy(proxy, nexo.id);
    }).toThrow(ProxyError);
  });
});
