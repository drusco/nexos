import ProxyNexo from "../lib/ProxyNexo.js";
import { findProxy } from "./index.js";
import map from "../lib/maps.js";

const nexo = new ProxyNexo();

describe("findProxy", () => {
  it("Finds a proxy by itself", () => {
    const proxy = nexo.createProxy();
    const result = findProxy(proxy);

    expect(result).toStrictEqual(proxy);
  });

  it("Finds a proxy by its target", () => {
    const target = [];
    const proxy = nexo.createProxy(target);
    const result = findProxy(target);

    expect(result).toStrictEqual(proxy);
  });

  it("Finds a proxy by its mock", () => {
    const proxy = nexo.createProxy();
    const { mock } = map.proxies.get(proxy);
    const result = findProxy(mock.deref());

    expect(result).toStrictEqual(proxy);
  });

  it("Returns undefined when the proxy is not found", () => {
    const result = findProxy({});

    expect(result).toBeUndefined();
  });
});
