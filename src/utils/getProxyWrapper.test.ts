import Nexo from "../Nexo.js";
import getProxyWrapper from "./getProxyWrapper.js";
import { getProxyMap } from "./constants.js";
import ProxyError from "./ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxyWrapper", () => {
  it("Access the wrapper using a sanboxed proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper.traceable).toBe(false);
  });

  it("Access the wrapper using a traceable proxy", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const wrapper = getProxyWrapper(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper.traceable).toBe(true);
  });

  it("Throws when the wrapper cannot be found", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    // force proxy removal from map of proxies
    getProxyMap().delete(proxy);

    expect(() => getProxyWrapper(proxy)).toThrow(ProxyError);
  });
});
