import Nexo from "../Nexo.js";
import { getProxy, map } from "./index.js";

const nexo = new Nexo();

describe("utils/getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const proxy = getProxy(nexo);
    const data = map.proxies.get(proxy);

    expect(data.target).toBeUndefined();
    expect(data.scope.deref()).toStrictEqual(nexo);
    expect(typeof data.id).toBe("string");
    expect(typeof data.mock.deref()).toBe("function");
    expect(data.sandbox instanceof Map).toBe(true);
    expect(data.isExtensible).toBe(true);
  });

  it("Links internal data using weak maps", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);
    const data = map.proxies.get(proxy);

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.proxies.has(proxyWithTarget)).toBe(true);
    expect(map.tracables.has(data.mock.deref())).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
  });

  it("Exposes the proxy to the nexo instance", () => {
    const proxy = getProxy(nexo);
    const data = map.proxies.get(proxy);

    expect(nexo.proxies.has(data.id)).toBe(true);
    expect(nexo.proxies.get(data.id).deref()).toStrictEqual(proxy);
  });

  it("Emits an event for new proxies", () => {
    const createCallback = jest.fn();

    nexo.on("nx.create", createCallback);
    const proxy = getProxy(nexo);
    const data = map.proxies.get(proxy);

    expect(createCallback).toHaveBeenCalledWith(data.id, undefined);
  });

  it("Returns an existing proxy", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toStrictEqual(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toStrictEqual(proxyWithTarget);
    expect(getProxy(nexo, target)).toStrictEqual(proxyWithTarget);
  });
});
