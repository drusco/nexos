import ProxyNexo from "../Nexo.js";
import findProxy from "./findProxy.js";
import map from "./maps.js";

const nexo = new ProxyNexo();

describe("findProxy", () => {
  it("Finds a proxy by itself", () => {
    const proxy = nexo.proxy();
    const result = findProxy(proxy);

    expect(result).toBe(proxy);
  });

  it("Finds a proxy by its target", () => {
    const target = [];
    const proxy = nexo.proxy(target);
    const result = findProxy(target);

    expect(result).toBe(proxy);
  });

  it("Finds a proxy by its wrapper", () => {
    const proxy = nexo.proxy();
    const { wrapper } = map.proxies.get(proxy);
    const result = findProxy(wrapper);

    expect(result).toBe(proxy);
  });

  it("Returns undefined when the proxy is not found", () => {
    const result = findProxy({});

    expect(result).toBeUndefined();
  });
});
