import Nexo from "../Nexo.js";
import getProxy from "./getProxy.js";
import map from "./maps.js";
import ProxyWrapper from "./ProxyWrapper.js";

const nexo = new Nexo();

describe("getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const proxy = getProxy(nexo);
    const wrapper = new ProxyWrapper(proxy);
    const data = map.proxies.get(proxy);

    expect(data?.id).toBe(wrapper.id);
    expect(data?.fn).toBe(wrapper?.fn);
    expect(data?.target).toBeUndefined();
  });

  it("Creates a new proxy with a custom target", () => {
    const target = [];
    const proxy = getProxy(nexo, target);
    const data = map.proxies.get(proxy);

    expect(data?.target).toBe(target);
  });

  it("Creates a new proxy with a custom id", () => {
    const proxy = getProxy(nexo, undefined, "foo");
    const data = map.proxies.get(proxy);

    expect(data?.id).toBe("foo");
    expect(data?.target).toBeUndefined();
  });

  it("Links internal data using weak maps", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);
    const wrapper = new ProxyWrapper(proxy);

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.proxies.has(proxyWithTarget)).toBe(true);
    expect(map.tracables.has(wrapper.fn)).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
  });

  it("Returns an existing proxy", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toBe(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toBe(proxyWithTarget);
    expect(getProxy(nexo, target)).toBe(proxyWithTarget);
  });
});
