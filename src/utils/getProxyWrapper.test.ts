import Nexo from "../Nexo.js";
import maps from "./maps.js";
import ProxyError from "./ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxyWrapper", () => {
  it("Access the wrapper using the sanboxed proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Access the wrapper using the traceable proxy", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
  });

  it("Throws when the wrapper cannot be found", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    // force proxy removal from map of proxies
    maps.proxies.delete(proxy);

    expect(() => Nexo.wrap(proxy)).toThrow(ProxyError);
  });
});
