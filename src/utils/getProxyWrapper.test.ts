import getProxyWrapper from "./getProxyWrapper.js";
import getProxyMap from "./getProxyMap.js";
import ProxyError from "./ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxyWrapper", () => {
  it("Access the wrapper using a sanboxed proxy", () => {
    const { proxy } = new ProxyWrapper();
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper.traceable).toBe(false);
  });

  it("Access the wrapper using a traceable proxy", () => {
    const target = {};
    const wrapper = new ProxyWrapper(target);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper.traceable).toBe(true);
  });

  it("Throws when the wrapper cannot be found", () => {
    const wrapper = new ProxyWrapper();

    // force proxy removal from map of proxies
    getProxyMap().delete(wrapper.proxy);

    expect(() => getProxyWrapper(wrapper.proxy)).toThrow(ProxyError);
  });
});
