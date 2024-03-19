import Nexo from "../Nexo.js";
import NexoTS from "../types/Nexo.js";
import { getProxy, map } from "./index.js";

const nexo = new Nexo();

describe("utils/getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const proxy = getProxy(nexo);

    testProxyData(proxy);
  });

  it("Creates a new proxy with custom data and a target", () => {
    const arrayTarget = [];
    const proxy = getProxy(nexo, arrayTarget);

    testProxyData(proxy, arrayTarget);
  });

  it("Links internal data using weak maps", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);
    const proxyData = map.proxies.get(proxy);
    const proxyWithTargetData = map.proxies.get(proxyWithTarget);

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.proxies.has(proxyWithTarget)).toBe(true);
    expect(map.tracables.has(proxyData.mock.deref())).toBe(true);
    expect(map.tracables.has(proxyWithTargetData.mock.deref())).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
  });

  it("Exposes the proxy to the nexo instance", () => {
    const proxy = getProxy(nexo);
    const { id } = map.proxies.get(proxy);

    expect(nexo.proxies.has(id)).toBe(true);
    expect(nexo.proxies.get(id).deref()).toStrictEqual(proxy);
  });

  it("Emits an event for new proxies", () => {
    const createCallback = jest.fn();

    nexo.on("nx.create", createCallback);
    const proxy = getProxy(nexo);
    const { id } = map.proxies.get(proxy);

    expect(createCallback).toHaveBeenCalledWith(id, undefined);
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

function testProxyData(
  proxy: NexoTS.Proxy,
  proxyTarget: NexoTS.traceable | void,
) {
  const { id, scope, mock, sandbox, isExtensible, target } =
    map.proxies.get(proxy);

  const $target = target ? target.deref() : target;

  expect(typeof id).toBe("string");
  expect(typeof mock.deref()).toBe("function");
  expect(scope.deref()).toStrictEqual(nexo);
  expect(sandbox).toBeInstanceOf(Map);
  expect(isExtensible).toBe(true);
  expect($target).toStrictEqual(proxyTarget);
}
